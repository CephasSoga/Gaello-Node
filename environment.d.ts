// environment.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        MONGO_URI: string;
        MONGO_DB: string;
        BRIGHT_DATA_HOST: string;
        BRIGHT_DATA_USERNAME: string;
        BRIGHT_DATA_PASSWORD: string;
        BRIGHT_DATA_PORT: string;
        RMQ_PROTOCOL: string;
        RMQ_HOST: string;
        RMQ_PORT: string;
        RMQ_QUEUE: string;
        FMP_API_KEY: string;
        FMP_API_BASE_URL: string;
        EOD_API_KEY: string;
    }
  }
  