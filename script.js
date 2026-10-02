// ==========================================
// REAL CURRENCY RATES
// Frankfurter API
// ==========================================

const API_URL =
    "https://api.frankfurter.dev/v2/rates?base=EUR";

let rates = {};
let ratesDate = null;




async function loadRealRates() {

    const status =
        document.getElementById("status");

    try {

        status.textContent =
            "⏳ Завантаження актуальних курсів...";


        const response =
            await fetch(API_URL, {
                cache: "no-store"
            });


        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }


        const data =
            await response.json();


        // EUR завжди дорівнює 1
        rates = {
            EUR: 1
        };


        // Додаємо всі курси з API
        data.forEach(item => {

            rates[item.quote] =
                Number(item.rate);

        });


        /*
          Зберігаємо дату оновлення,
          якщо API її повертає.
        */

        ratesDate =
            data[0]?.date || null;


        status.textContent =
            "🟢 Актуальні курси завантажено";


        // Оновлюємо конвертер
        convert();


        // Показуємо дату
        showRatesDate();


    } catch (error) {

        console.error(
            "Помилка отримання курсів:",
            error
        );


        status.textContent =
            "🔴 Не вдалося завантажити курси";


        /*
          Якщо інтернету немає,
          попередній результат не вигадуємо.
        */

        document.getElementById("result")
            .textContent = "—";

    }
}


// ==========================================
// ПОКАЗ ДАТИ КУРСУ
// ==========================================

function showRatesDate() {

    const updated =
        document.getElementById("updated");


    if (!updated) return;


    if (ratesDate) {

        updated.textContent =
            `Курси від ${ratesDate}`;

    } else {

        updated.textContent =
            "Курси отримані онлайн";

    }
}


// ==========================================
// КОНВЕРТАЦІЯ
// ==========================================

function convert() {

    const amountElement =
        document.getElementById("amount");

    const fromElement =
        document.getElementById("from");

    const toElement =
        document.getElementById("to");


    const resultElement =
        document.getElementById("result");

    const rateElement =
        document.getElementById("rate");


    if (
        !amountElement ||
        !fromElement ||
        !toElement ||
        !resultElement
    ) {
        return;
    }


    const amount =
        Number(amountElement.value);


    const from =
        fromElement.value;


    const to =
        toElement.value;


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        resultElement.textContent =
            "—";

        return;
    }


    if (
        !rates[from] ||
        !rates[to]
    ) {

        resultElement.textContent =
            "—";

        if (rateElement) {
            rateElement.textContent =
                "Курс недоступний";
        }

        return;
    }


    /*
      API дає курси відносно EUR.

      Наприклад:

      EUR = 1
      USD = 1.17
      UAH = ...

      Тому:

      USD → UAH

      USD → EUR → UAH
    */


    const amountInEUR =
        amount / rates[from];


    const converted =
        amountInEUR * rates[to];


    const oneUnit =
        rates[to] / rates[from];


    const formatter =
        new Intl.NumberFormat(
            document.documentElement.lang || "uk-UA",
            {
                maximumFractionDigits: 6
            }
        );


    resultElement.textContent =
        `${formatter.format(converted)} ${to}`;


    if (rateElement) {

        rateElement.textContent =
            `1 ${from} = ${formatter.format(oneUnit)} ${to}`;

    }
}




function swapCurrencies() {

    const from =
        document.getElementById("from");

    const to =
        document.getElementById("to");


    if (!from || !to) return;


    const oldFrom =
        from.value;


    from.value =
        to.value;


    to.value =
        oldFrom;


    convert();
}


// ==========================================
// АВТОМАТИЧНЕ ОНОВЛЕННЯ
// ==========================================

async function updateRates() {

    await loadRealRates();

}


// Оновлюємо курси кожні 30 хвилин
setInterval(
    updateRates,
    30 * 60 * 1000
);


// ==========================================
// СТАРТ
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRealRates();


        const amount =
            document.getElementById("amount");


        const from =
            document.getElementById("from");


        const to =
            document.getElementById("to");


        if (amount) {
            amount.addEventListener(
                "input",
                convert
            );
        }


        if (from) {
            from.addEventListener(
                "change",
                convert
            );
        }


        if (to) {
            to.addEventListener(
                "change",
                convert
            );
        }

    }
);

