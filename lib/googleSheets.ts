import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

type SheetAppendResult = {
  sheetUrl?: string;
  range?: string;
};

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function getSheetsClient() {
  if (
    !process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY ||
    !process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  ) {
    return null;
  }

  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    SCOPES
  );

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

export async function appendOccurrenceToSheet(row: string[]): Promise<SheetAppendResult | null> {
  const sheets = getSheetsClient();
  if (!sheets) return null;

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
  const tabName = process.env.GOOGLE_SHEETS_TAB_NAME ?? "Ocorrencias";

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row]
    }
  });

  const updatedRange = response.data.updates?.updatedRange;

  if (!updatedRange) return null;

  const gid = process.env.GOOGLE_SHEETS_TAB_GID ?? "0";
  const rangeRef = updatedRange.split("!")[1] ?? updatedRange;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}&range=${encodeURIComponent(rangeRef)}`;

  return { sheetUrl, range: updatedRange };
}
