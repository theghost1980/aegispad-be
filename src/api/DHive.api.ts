import { Account, Client, ClientOptions } from "@hiveio/dhive";

const clientOptions: ClientOptions = {
  timeout: 5000,
};

const client = new Client(
  [
    "https://api.hive.blog",
    "https://api.deathwing.me",
    "https://rpc.ausbit.dev",
  ],
  clientOptions
);

export const getDHiveClient = () => client;

export async function getAccountByUsername(
  username: string
): Promise<Account | null> {
  try {
    const accounts = await client.database.getAccounts([username]);

    if (accounts && accounts.length > 0) {
      return accounts[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching account "${username}":`, error);
    return null;
  }
}

/**
 * Fetches and parses the JSON metadata for a given Hive account.
 * @param accountName The name of the Hive account.
 * @returns A Promise resolving to the parsed metadata object.
 * Returns `null` if the account is not found.
 * Returns `{}` if the account exists but has no json_metadata.
 * @throws Throws an error if the RPC call or metadata parsing fails.
 */
export async function getAccountMetadata(
  accountName: string
): Promise<any | null> {
  if (!accountName || typeof accountName !== "string") {
    throw new Error("Account name must be a non-empty string.");
  }

  try {
    const accounts = await client.database.getAccounts([accountName]);
    if (!accounts || accounts.length === 0) {
      return null;
    }

    const account = accounts[0];
    const metadataString = account.json_metadata;

    if (!metadataString || metadataString.trim() === "") {
      return {};
    }

    try {
      const metadata = JSON.parse(metadataString);
      return metadata;
    } catch (parseError: any) {
      console.error(
        `Failed to parse json_metadata for account "${accountName}":`,
        parseError.message
      );
      throw new Error(
        `Invalid JSON metadata for account "${accountName}": ${parseError.message}`
      );
    }
  } catch (rpcError: any) {
    console.error(
      `Error fetching metadata for account "${accountName}":`,
      rpcError.message
    );
    throw rpcError;
  }
}
