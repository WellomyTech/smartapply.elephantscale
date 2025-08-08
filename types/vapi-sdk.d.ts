// types/vapi-sdk.d.ts
export {};

declare global {
  interface Window {
    vapiSDK?: {
      run(options: {
        assistant: string;
        apiKey: string;
        context : Record<string, unknown>;
      }): void;
    };
  }
}
