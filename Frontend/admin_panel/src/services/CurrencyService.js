class CurrencyService {
    constructor() {
        this.baseUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
        this.baseCurrency = 'rub'; // Базовая валюта — российский рубль
        this.rates = { usd: 0, byn: 0, rub: 1 }; // Кэшированные курсы
        this.lastFetched = null;
    }

    // Получение курсов валют из API
    async fetchExchangeRates() {
        // Кэшируем курсы на 1 час
        if (this.lastFetched && Date.now() - this.lastFetched < 3600000) {
            return this.rates;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.baseCurrency}.json`);
            if (!response.ok) {
                throw new Error('Не удалось загрузить курсы валют');
            }
            const data = await response.json();
            this.rates = {
                usd: data[this.baseCurrency].usd,
                byn: data[this.baseCurrency].byn,
                rub: data[this.baseCurrency].rub,
            };
            this.lastFetched = Date.now();
            return this.rates;
        } catch (error) {
            console.error('Ошибка загрузки курсов валют:', error);
            // Фаллбэк на вторичный эндпоинт
            try {
                const fallbackResponse = await fetch(
                    `https://latest.currency-api.pages.dev/v1/currencies/${this.baseCurrency}.json`
                );
                if (!fallbackResponse.ok) {
                    throw new Error('Не удалось загрузить курсы валют из фаллбэк-эндпоинта');
                }
                const fallbackData = await fallbackResponse.json();
                this.rates = {
                    usd: fallbackData[this.baseCurrency].usd,
                    byn: fallbackData[this.baseCurrency].byn,
                    rub: fallbackData[this.baseCurrency].rub,
                };
                this.lastFetched = Date.now();
                return this.rates;
            } catch (fallbackError) {
                console.error('Ошибка загрузки курсов валют из фаллбэк-эндпоинта:', fallbackError);
                throw fallbackError;
            }
        }
    }

    // Конвертация суммы из базовой валюты (RUB) в целевую валюту
    async convert(amount, toCurrency) {
        await this.fetchExchangeRates();
        const currency = toCurrency.toLowerCase();
        if (!this.rates[currency]) {
            throw new Error(`Неподдерживаемая валюта: ${toCurrency}`);
        }
        return (amount * this.rates[currency]).toFixed(2);
    }

    // Получение символа или аббревиатуры валюты
    getCurrencySymbol(currency) {
        const symbols = {
            USD: '$',
            BYN: 'Br',
            RUB: 'руб.',
        };
        return symbols[currency] || currency;
    }
}

export default new CurrencyService();