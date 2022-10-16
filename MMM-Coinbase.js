Module.register("MMM-Coinbase", {
  defaults: {
    apiKey: "",
    apiSecret: "",
    wallet: ["BTC"],
    icons: true, // currently only Bitcoin and Ethereum supported
    label: false,
    showBalanceInOriginalCurrency: false,
    updateInterval: 10 // in seconds
  },

  getStyles: function () {
    return [this.file("css/styles.css")];
  },

  start: function () {
    this.icons = {
      BTC: "bitcoin",
      ETH: "ethereum"
    };
    this.balance = 0;
    this.currency = "";
    this.cryptoData = [];
    this.sendSocketNotification("GET_ACCOUNTS", {
      apiKey: this.config.apiKey,
      apiSecret: this.config.apiSecret,
      wallet: this.config.wallet
    });
  },

  getHeader: function () {
    return (
      "<div class='header'><span class='left'>" +
      this.data.header +
      ": " +
      "</span><span class='right'>" +
      this.balance +
      " " +
      this.currency +
      "</span></div>"
    );
  },

  getDom: function () {
    const elem = document.createElement("div");
    elem.id = "accountWrapper";

    const module = this;
    const config = this.config;
    const icons = this.icons;

    let balanceKey = "balance";
    if (!config.showBalanceInOriginalCurrency) {
      balanceKey = "native_balance";
    }
    this.cryptoData.forEach((accts) => {
      module.balance += parseInt(accts.native_balance.amount);

      // check if currency is in config
      if (config.wallet.indexOf(accts.currency) > -1) {
        // add div ROW for currency
        const rowElement = document.createElement("div");
        rowElement.className = "row";
        rowElement.id = accts.currency + "Counter";

        // Create column for icon if icons have been activated
        if (config.icons) {
          const columnIconElement = document.createElement("div");
          columnIconElement.className = "column icon";

          if (icons.hasOwnProperty(accts.currency))
            columnIconElement.innerHTML =
              "<i class='fa fa-" + icons[accts.currency] + "'></i>";
          else
            columnIconElement.innerHTML =
              "<span class='currency-name'>" +
              accts.currency.toUpperCase() +
              "</span>";

          rowElement.appendChild(columnIconElement);
        }

        if (config.label) {
          const columnCurrencyElement = document.createElement("div");
          columnCurrencyElement.className = "column";
          columnCurrencyElement.innerHTML =
            "<span>" + accts.currency + "</span>";
          rowElement.appendChild(columnCurrencyElement);
        }

        const columnAmountElement = document.createElement("div");
        columnAmountElement.className = "column";
        const accountAmount = accts[balanceKey].amount;
        columnAmountElement.innerHTML = "<span> " + accountAmount + "</span>";

        rowElement.appendChild(columnAmountElement);
        elem.appendChild(rowElement);
      }
    });

    return elem;
  },

  computeTotalBalance: function () {
    let total = 0;
    for (const crypto of this.cryptoData) {
      total += parseInt(crypto.native_balance.amount);
    }
    this.balance = total;
  },

  notificationReceived: function (notification) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        setInterval(() => {
          this.sendSocketNotification("GET_ACCOUNTS", {
            apiKey: this.config.apiKey,
            apiSecret: this.config.apiSecret,
            wallet: this.config.wallet
          });
        }, this.config.updateInterval * 1000);

        break;
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "ACCOUNTS":
        this.cryptoData = payload;
        this.currency = payload[0].native_balance.currency;
        this.computeTotalBalance();
        this.updateDom();
        break;
    }
  }
});
