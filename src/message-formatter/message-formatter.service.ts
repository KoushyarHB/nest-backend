export class MessageFormatterService {
  formatMessage(message: string): string {
    const timeStamp = new Date().toISOString();
    return `[${timeStamp}] ${message}`;
  }
}
