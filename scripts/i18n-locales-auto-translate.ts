import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get the directory of the current script
const currentDir = __dirname;

// Resolve the path to the 'locales' directory relative to the current script's directory
const LOCALES_DIR = path.resolve(currentDir, '../packages/sdk/src/locales');

// Path to the English JSON file
const EN_FILE_PATH = path.join(LOCALES_DIR, 'en.json');

// Function to get all locale files except the English one
function getI18nFilePaths() {
  const allFiles = fs.readdirSync(LOCALES_DIR);
  return allFiles
    .filter((file) => file.endsWith('.json') && file !== 'en.json')
    .map((file) => path.join(LOCALES_DIR, file));
}

const I18N_FILES_PATHS = getI18nFilePaths();

// Define a recursive type for the structure of locale files
type LocaleEntry = {
  [key: string]: string | LocaleEntry;
};

// Function to read JSON file
function readJsonFile(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Function to compare and find missing translations
function findMissingTranslations(enJson: LocaleEntry, otherJson: LocaleEntry) {
  const missingTranslations: LocaleEntry = {};

  Object.keys(enJson).forEach((key) => {
    if (typeof enJson[key] === 'object' && enJson[key] !== null) {
      if (!otherJson[key]) {
        otherJson[key] = {};
      }

      missingTranslations[key] = findMissingTranslations(
        enJson[key] as LocaleEntry,
        otherJson[key] as LocaleEntry,
      );
    } else if (!otherJson[key]) {
      missingTranslations[key] = enJson[key];
    }
  });

  return missingTranslations;
}

function getLanguageCode(filePath: string) {
  return path.basename(filePath, '.json');
}

// Function to translate text using ChatGPT API
async function translateText(text: string, targetLang: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You will be provided with a sentence in English, and your task is to translate it into ${targetLang}.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    });

    if (response?.choices && response.choices.length > 0) {
      return response.choices[0]?.message?.content?.trim() || '';
    }

    throw new Error('No translation found in response');
  } catch (error) {
    console.error('Error translating text:', error);
    return null;
  }
}

async function updateTranslations(
  jsonObject: LocaleEntry,
  translations: LocaleEntry,
  targetLang: string,
) {
  for (const key in translations) {
    if (typeof translations[key] === 'object' && translations[key] !== null) {
      await updateTranslations(
        jsonObject[key] as LocaleEntry,
        translations[key] as LocaleEntry,
        targetLang,
      );
    } else if (typeof translations[key] === 'string') {
      const t = await translateText(translations[key] as string, targetLang);

      if (t) {
        jsonObject[key] = t;
      }
    }
  }
}

// Main function to update i18n files
async function updateI18nFiles() {
  console.log('Updating i18n locales files...');
  const enJson = readJsonFile(EN_FILE_PATH);

  for (const filePath of I18N_FILES_PATHS) {
    const otherJson = readJsonFile(filePath);
    const targetLangCode = getLanguageCode(filePath);

    const missingTranslations = findMissingTranslations(enJson, otherJson);

    await updateTranslations(otherJson, missingTranslations, targetLangCode); // Replace 'es' with the target language code

    fs.writeFileSync(filePath, JSON.stringify(otherJson, null, 2));
  }
}

updateI18nFiles().then(() =>
  console.log('i18n locales files updated successfully ✅'),
);
