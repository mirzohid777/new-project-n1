$(document).ready(function () {
  let transactions = [];
  let currentLang = "uz";
  let currentTheme = "light";
  let currentFilter = "all";
  let searchQuery = "";
  let lastNotificationShown = null;

  const translations = {
    uz: {
      pageTitle: "Kunlik Daromad va Xarajat Tizimi",
      balanceLabel: "Umumiy Balans",
      incomeLabel: "Daromad",
      expenseLabel: "Xarajat",
      formTitle: "Yangi Kiritma",
      descLabel: "Tavsif",
      amountLabel: "Summa",
      dateLabel: "Sana",
      btnIncome: "+ Daromad",
      btnExpense: "- Xarajat",
      btnPayment: "💰 Sarqi/To'lov",
      historyTitle: "Tarix",
      remainingLabel: "Qoldiq",
      profileTitle: "Mening Profilim",
      themeLabel: "Rang Tanlash",
      langLabel: "Til Tanlash",
      lightText: "Oq",
      darkText: "Qora",
      emptyText: "Hali hech narsa yo'q",
      descPlaceholder: "Masalan: Ish haqi",
      amountPlaceholder: "0",
      todayIncomeLabel: "Bugungi Kirim",
      todayExpenseLabel: "Bugungi Chiqim",
      filterTitle: "Qidirish va Filtr",
      searchPlaceholder: "Tavsif bo'yicha qidirish...",
      filterAll: "Hammasi",
      filterIncome: "Daromad",
      filterExpense: "Xarajat",
      filterToday: "Bugun",
      filterWeek: "Bu hafta",
      filterMonth: "Bu oy",
      weeklyNotification:
        "💰 HAR HAFTALIK ESLATMA: Platformani yaratgan yosh dasturchiga haftada bir marta to'lov qilishingiz SHART! Iltimos, bugun to'lovni amalga oshiring!",
    },
    ru: {
      pageTitle: "Система Ежедневных Доходов и Расходов",
      balanceLabel: "Общий Баланс",
      incomeLabel: "Доход",
      expenseLabel: "Расход",
      formTitle: "Новая Запись",
      descLabel: "Описание",
      amountLabel: "Сумма",
      dateLabel: "Дата",
      btnIncome: "+ Доход",
      btnExpense: "- Расход",
      btnPayment: "💰 Оплата",
      historyTitle: "История",
      remainingLabel: "Остаток",
      profileTitle: "Мой Профиль",
      themeLabel: "Выбрать Тему",
      langLabel: "Выбрать Язык",
      lightText: "Светлая",
      darkText: "Темная",
      emptyText: "Пока ничего нет",
      descPlaceholder: "Например: Зарплата",
      amountPlaceholder: "0",
      todayIncomeLabel: "Сегодняшний Доход",
      todayExpenseLabel: "Сегодняшний Расход",
      filterTitle: "Поиск и Фильтр",
      searchPlaceholder: "Поиск по описанию...",
      filterAll: "Все",
      filterIncome: "Доход",
      filterExpense: "Расход",
      filterToday: "Сегодня",
      filterWeek: "Эта неделя",
      filterMonth: "Этот месяц",
      weeklyNotification:
        "💰 ЕЖЕНЕДЕЛЬНОЕ НАПОМИНАНИЕ: Вы ОБЯЗАНЫ оплачивать молодому разработчику платформы раз в неделю! Пожалуйста, сделайте оплату сегодня!",
    },
  };

  function checkNotifications() {
    const now = new Date();
    const today = now.toDateString();

    try {
      const lastShown = localStorage.getItem("lastNotificationShown");
      if (lastShown === today) {
        return;
      }
    } catch (e) {
      console.log("Notification check failed");
    }

    const dayOfWeek = now.getDay();

    const daysSinceStart = Math.floor(
      (now - new Date(2025, 0, 1)) / (1000 * 60 * 60 * 24)
    );

    if (dayOfWeek === 1 || dayOfWeek === 5 || daysSinceStart % 2 === 0) {
      const t = translations[currentLang];
      showNotification(t.weeklyNotification);

      try {
        localStorage.setItem("lastNotificationShown", today);
      } catch (e) {
        console.log("Notification save failed");
      }
    }
  }

  function showNotification(message) {
    const $banner = $("#notificationBanner");
    $("#notificationText").text(message);
    $banner.addClass("show");

    setTimeout(() => {
      $banner.removeClass("show");
    }, 15000);
  }

  function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    $("#pageTitle").text(t.pageTitle);
    $("#balanceLabel").text(t.balanceLabel);
    $("#incomeLabel").text(t.incomeLabel);
    $("#expenseLabel").text(t.expenseLabel);
    $("#formTitle").text(t.formTitle);
    $("#descLabel").text(t.descLabel);
    $("#amountLabel").text(t.amountLabel);
    $("#dateLabel").text(t.dateLabel);
    $("#btnIncome").text(t.btnIncome);
    $("#btnExpense").text(t.btnExpense);
    $("#btnPayment").text(t.btnPayment);
    $("#historyTitle").text(t.historyTitle);
    $("#profileTitle").text(t.profileTitle);
    $("#themeLabel").text(t.themeLabel);
    $("#langLabel").text(t.langLabel);
    $("#lightText").text(t.lightText);
    $("#darkText").text(t.darkText);
    $("#remainingLabel").text(t.remainingLabel);
    $("#todayIncomeLabel").text(t.todayIncomeLabel);
    $("#todayExpenseLabel").text(t.todayExpenseLabel);
    $("#filterTitle").text(t.filterTitle);
    $("#searchBox").attr("placeholder", t.searchPlaceholder);
    $("#filterAll").text(t.filterAll);
    $("#filterIncome").text(t.filterIncome);
    $("#filterExpense").text(t.filterExpense);
    $("#filterToday").text(t.filterToday);
    $("#filterWeek").text(t.filterWeek);
    $("#filterMonth").text(t.filterMonth);
    $("#description").attr("placeholder", t.descPlaceholder);

    if (transactions.length === 0) {
      $("#emptyText").text(t.emptyText);
    }
  }

  function updateTheme(theme) {
    currentTheme = theme;
    if (theme === "dark") {
      $("body").addClass("dark");
      $("#darkTheme").addClass("active");
      $("#lightTheme").removeClass("active");
    } else {
      $("body").removeClass("dark");
      $("#lightTheme").addClass("active");
      $("#darkTheme").removeClass("active");
    }

    try {
      localStorage.setItem("appTheme", theme);
    } catch (e) {
      console.log("Theme save failed");
    }
  }

  function loadTheme() {
    try {
      const savedTheme = localStorage.getItem("appTheme");
      if (savedTheme) {
        updateTheme(savedTheme);
      }
    } catch (e) {
      console.log("Theme load failed");
    }
  }

  function calculateBalance() {
    let totalIncome = 0;
    let totalExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
        if (
          t.timestamp >= todayStart.getTime() &&
          t.timestamp <= todayEnd.getTime()
        ) {
          todayIncome += t.amount;
        }
      } else {
        totalExpense += t.amount;
        if (
          t.timestamp >= todayStart.getTime() &&
          t.timestamp <= todayEnd.getTime()
        ) {
          todayExpense += t.amount;
        }
      }
    });

    const balance = totalIncome - totalExpense;
    const currency = currentLang === "uz" ? " so'm" : " сум";

    $("#totalBalance").text(formatNumber(balance) + currency);
    $("#totalIncome").text(formatNumber(totalIncome) + currency);
    $("#totalExpense").text(formatNumber(totalExpense) + currency);
    $("#totalRemaining").text(formatNumber(balance) + currency);
    $("#todayIncomeValue").text(formatNumber(todayIncome) + currency);
    $("#todayExpenseValue").text(formatNumber(todayExpense) + currency);

    saveToDatabase();
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function renderTransactions() {
    const $list = $("#transactionList");

    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (currentFilter !== "all") {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const todayEnd = todayStart + 86400000 - 1;

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();

      filtered = filtered.filter((t) => {
        if (currentFilter === "income") return t.type === "income";
        if (currentFilter === "expense") return t.type === "expense";
        if (currentFilter === "today")
          return t.timestamp >= todayStart && t.timestamp <= todayEnd;
        if (currentFilter === "week") return t.timestamp >= weekStart.getTime();
        if (currentFilter === "month") return t.timestamp >= monthStart;
        return true;
      });
    }

    if (filtered.length === 0) {
      const emptyText =
        currentLang === "uz" ? "Hech narsa topilmadi" : "Ничего не найдено";
      $list.html(`<p class="empty-state">${emptyText}</p>`);
      return;
    }

    $list.empty();

    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach((t, index) => {
      const sign = t.type === "income" ? "+" : "-";
      const currency = currentLang === "uz" ? " so'm" : " сум";

      const $item = $(`
                <div class="transaction-item ${t.type}">
                    <div class="transaction-info">
                        <div class="transaction-desc">${t.description}</div>
                        <div class="transaction-date">
                            <span>${formatDateTime(t.timestamp)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${sign} ${formatNumber(t.amount)}${currency}
                    </div>
                    <button class="delete-btn" data-id="${t.id}">×</button>
                </div>
            `);

      $list.append($item);
    });

    $(".delete-btn").click(function () {
      const id = $(this).data("id");
      deleteTransaction(id);
    });
  }

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    const daysUz = [
      "Yakshanba",
      "Dushanba",
      "Seshanba",
      "Chorshanba",
      "Payshanba",
      "Juma",
      "Shanba",
    ];
    const daysRu = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    const days = currentLang === "uz" ? daysUz : daysRu;

    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dayName}, ${day}.${month}.${year} - ${hours}:${minutes}`;
  }

  function deleteTransaction(id) {
    const confirmText =
      currentLang === "uz"
        ? "Rostdan ham o'chirmoqchimisiz?"
        : "Вы действительно хотите удалить?";

    if (confirm(confirmText)) {
      transactions = transactions.filter((t) => t.id !== id);
      calculateBalance();
      renderTransactions();
    }
  }

  function addTransaction(type) {
    const description = $("#description").val().trim();
    const amount = parseFloat($("#amount").val());

    if (!description || !amount || amount <= 0) {
      const msg =
        currentLang === "uz"
          ? "Iltimos, barcha maydonlarni to'ldiring!"
          : "Пожалуйста, заполните все поля!";
      alert(msg);
      return;
    }

    const transaction = {
      id: Date.now(),
      type: type,
      description: description,
      amount: amount,
      timestamp: Date.now(),
    };

    transactions.push(transaction);

    $("#description").val("");
    $("#amount").val("");

    calculateBalance();
    renderTransactions();
  }

  function saveToDatabase() {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (e) {
      console.log("Database save failed");
    }
  }

  function loadFromDatabase() {
    try {
      const saved = localStorage.getItem("transactions");
      if (saved) {
        transactions = JSON.parse(saved);
      }
    } catch (e) {
      console.log("Database load failed");
    }
  }

  $("#btnIncome").click(function () {
    addTransaction("income");
  });

  $("#btnExpense").click(function () {
    addTransaction("expense");
  });

  $("#btnPayment").click(function () {
    const description = $("#description").val().trim();
    const amount = parseFloat($("#amount").val());

    if (!description) {
      $("#description").val("Sarqi/To'lov - Dasturchiga to'lov");
    }

    if (!amount || amount <= 0) {
      const msg =
        currentLang === "uz"
          ? "Iltimos, summani kiriting!"
          : "Пожалуйста, введите сумму!";
      alert(msg);
      return;
    }

    const confirmMsg =
      currentLang === "uz"
        ? `${formatNumber(amount)} so'm to'lovni amalga oshirmoqchimisiz?`
        : `Вы хотите совершить оплату на ${formatNumber(amount)} сум?`;

    if (confirm(confirmMsg)) {
      const paymentDesc =
        $("#description").val().trim() ||
        (currentLang === "uz" ? "Sarqi/To'lov" : "Оплата");

      const transaction = {
        id: Date.now(),
        type: "expense",
        description: "💰 " + paymentDesc,
        amount: amount,
        timestamp: Date.now(),
      };

      transactions.push(transaction);

      $("#description").val("");
      $("#amount").val("");

      calculateBalance();
      renderTransactions();

      const successMsg =
        currentLang === "uz"
          ? "To'lov muvaffaqiyatli amalga oshirildi!"
          : "Оплата успешно выполнена!";
      alert(successMsg);
    }
  });

  $("#lightTheme").click(function () {
    updateTheme("light");
  });

  $("#darkTheme").click(function () {
    updateTheme("dark");
  });

  $("#languageSelect").change(function () {
    updateLanguage($(this).val());
    renderTransactions();
    calculateBalance();
  });

  $("#mobileProfileBtn").click(function () {
    $("#sidebar").addClass("active");
    $("#sidebarOverlay").addClass("active");
  });

  $("#sidebarOverlay").click(function () {
    $("#sidebar").removeClass("active");
    $("#sidebarOverlay").removeClass("active");
  });

  $("#closeSidebarBtn").click(function (e) {
    e.stopPropagation();
    $("#sidebar").removeClass("active");
    $("#sidebarOverlay").removeClass("active");
  });

  $("#closeNotif").click(function () {
    $("#notificationBanner").removeClass("show");
  });

  $("#searchBox").on("input", function () {
    searchQuery = $(this).val();
    renderTransactions();
  });

  $(".filter-btn").click(function () {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");
    currentFilter = $(this).data("filter");
    renderTransactions();
  });

  calculateBalance();
  renderTransactions();
  checkNotifications();
  loadTheme();
  loadFromDatabase();

  setInterval(checkNotifications, 60000);

  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    scrollbar: {
      el: ".swiper-scrollbar",
    },

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });

  $(document).ready(function () {
    let utilities = JSON.parse(localStorage.getItem("utilities")) || [];
    let currentUtilityId = null;

    function renderUtilities() {
      $("#utilitiesGrid").empty();
      utilities.forEach(function (utility) {
        let lastPayment =
          utility.payments.length > 0
            ? utility.payments[utility.payments.length - 1].amount
            : 0;

        let card = `
                        <div class="utility-card" data-id="${utility.id}">
                            <button class="card-delete-btn" data-id="${
                              utility.id
                            }" title="O'chirish">×</button>
                            <h3>${utility.type}</h3>
                            <div class="house-number">🏠 Uy: ${
                              utility.houseNumber
                            }</div>
                            <div class="price">${formatMoney(
                              lastPayment
                            )} so'm</div>
                            <div class="house-number">📊 To'lovlar: ${
                              utility.payments.length
                            }</div>
                        </div>
                    `;
        $("#utilitiesGrid").append(card);
      });
    }

    function formatMoney(amount) {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function generatePaymentId() {
      return (
        "PAY-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 9).toUpperCase()
      );
    }

    $("#addUtilityBtn").click(function () {
      $("#addModal").fadeIn();
    });

    $("#closeAddModal").click(function () {
      $("#addModal").fadeOut();
    });

    $("#addUtilityForm").submit(function (e) {
      e.preventDefault();

      let newUtility = {
        id: Date.now(),
        type: $("#utilityType").val(),
        houseNumber: $("#houseNumber").val(),
        payments: [
          {
            amount: parseInt($("#amount").val()),
            date: new Date().toLocaleString("uz-UZ"),
            paymentId: generatePaymentId(),
          },
        ],
      };

      utilities.push(newUtility);
      localStorage.setItem("utilities", JSON.stringify(utilities));
      renderUtilities();
      $("#addModal").fadeOut();
      $("#addUtilityForm")[0].reset();
    });

    $(document).on("click", ".card-delete-btn", function (e) {
      e.stopPropagation();
      let utilityId = $(this).data("id");
      let utility = utilities.find((u) => u.id === utilityId);

      if (
        confirm(
          `"${utility.type} - Uy ${utility.houseNumber}" to'lovini butunlay o'chirmoqchimisiz?\n\nBarcha to'lov tarixi o'chib ketadi!`
        )
      ) {
        utilities = utilities.filter((u) => u.id !== utilityId);
        localStorage.setItem("utilities", JSON.stringify(utilities));
        renderUtilities();
      }
    });

    $(document).on("click", ".utility-card", function () {
      currentUtilityId = $(this).data("id");
      let utility = utilities.find((u) => u.id === currentUtilityId);

      $("#historyTitle").text(utility.type + " - Uy " + utility.houseNumber);
      $("#paymentHistory").empty();

      utility.payments.forEach(function (payment, index) {
        let prevAmount = index > 0 ? utility.payments[index - 1].amount : 0;
        let difference = payment.amount - prevAmount;
        let diffText =
          index > 0
            ? difference >= 0
              ? `<span style="color: #ff4757;">+${formatMoney(
                  difference
                )} so'm</span>`
              : `<span style="color: #2ed573;">${formatMoney(
                  difference
                )} so'm</span>`
            : "";

        let item = `
                        <div class="payment-item">
                            <button class="delete-btn" data-index="${index}">O'chirish</button>
                            <div class="date">📅 ${payment.date}</div>
                            <div class="amount">${formatMoney(
                              payment.amount
                            )} so'm ${diffText}</div>
                            <div class="payment-id">ID: ${
                              payment.paymentId
                            }</div>
                        </div>
                    `;
        $("#paymentHistory").append(item);
      });

      $("#historyModal").fadeIn();
    });

    $("#closeHistoryModal").click(function () {
      $("#historyModal").fadeOut();
    });

    $(document).on("click", ".delete-btn", function (e) {
      e.stopPropagation();
      let index = $(this).data("index");
      let utility = utilities.find((u) => u.id === currentUtilityId);

      if (confirm("Bu to'lovni o'chirmoqchimisiz?")) {
        utility.payments.splice(index, 1);

        if (utility.payments.length === 0) {
          utilities = utilities.filter((u) => u.id !== currentUtilityId);
          $("#historyModal").fadeOut();
        }

        localStorage.setItem("utilities", JSON.stringify(utilities));
        renderUtilities();

        if (utility.payments.length > 0) {
          $("#paymentHistory").empty();
          utility.payments.forEach(function (payment, idx) {
            let prevAmount = idx > 0 ? utility.payments[idx - 1].amount : 0;
            let difference = payment.amount - prevAmount;
            let diffText =
              idx > 0
                ? difference >= 0
                  ? `<span style="color: #ff4757;">+${formatMoney(
                      difference
                    )} so'm</span>`
                  : `<span style="color: #2ed573;">${formatMoney(
                      difference
                    )} so'm</span>`
                : "";

            let item = `
                                <div class="payment-item">
                                    <button class="delete-btn" data-index="${idx}">O'chirish</button>
                                    <div class="date">📅 ${payment.date}</div>
                                    <div class="amount">${formatMoney(
                                      payment.amount
                                    )} so'm ${diffText}</div>
                                    <div class="payment-id">ID: ${
                                      payment.paymentId
                                    }</div>
                                </div>
                            `;
            $("#paymentHistory").append(item);
          });
        }
      }
    });

    $("#addPaymentBtn").click(function () {
      $("#historyModal").fadeOut();
      $("#newPaymentModal").fadeIn();

      let utility = utilities.find((u) => u.id === currentUtilityId);
      $("#newPaymentTitle").text(utility.type + " uchun to'lov");
    });

    $("#closeNewPaymentModal").click(function () {
      $("#newPaymentModal").fadeOut();
      $("#historyModal").fadeIn();
    });

    $("#newPaymentForm").submit(function (e) {
      e.preventDefault();

      let utility = utilities.find((u) => u.id === currentUtilityId);
      let newPayment = {
        amount: parseInt($("#newPaymentAmount").val()),
        date: new Date().toLocaleString("uz-UZ"),
        paymentId: generatePaymentId(),
      };

      utility.payments.push(newPayment);
      localStorage.setItem("utilities", JSON.stringify(utilities));
      renderUtilities();
      $("#newPaymentModal").fadeOut();
      $("#newPaymentForm")[0].reset();
    });

    $(window).click(function (e) {
      if ($(e.target).hasClass("modal")) {
        $(".modal").fadeOut();
      }
    });

    renderUtilities();
  });
});
