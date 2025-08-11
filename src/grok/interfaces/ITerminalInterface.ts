// Terminal Interface Contract
// Defines the contract for terminal user interaction

export interface ITerminalInterface {
  /**
   * Start the terminal interface
   */
  start(): Promise<void>;

  /**
   * Display welcome message and instructions
   */
  displayWelcome(): void;

  /**
   * Prompt user for input
   */
  promptUser(): Promise<string>;

  /**
   * Display AI response with formatting
   */
  displayResponse(response: string, metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
  }): void;

  /**
   * Display error message to user
   */
  displayError(message: string, isRetryable?: boolean): void;

  /**
   * Display system status information
   */
  displayStatus(status: {
    connected: boolean;
    model: string;
    conversationLength: number;
  }): void;

  /**
   * Handle graceful exit
   */
  handleExit(): Promise<void>;

  /**
   * Check if user wants to exit
   */
  shouldExit(input: string): boolean;
}