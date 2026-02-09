import type { FilteredExportData } from './exportFilters';
import type { TranslationKey } from '../../i18n/translations';
import { downloadBlob } from '../download';

type TranslationFunction = (key: TranslationKey) => string;

export async function generateExport(
  data: FilteredExportData,
  format: 'csv' | 'txt' | 'sqlite',
  t: TranslationFunction
): Promise<void> {
  switch (format) {
    case 'csv':
      return generateCsvExport(data, t);
    case 'txt':
      return generateTxtExport(data, t);
    case 'sqlite':
      return generateSqliteExport(data, t);
  }
}

// CSV Export
async function generateCsvExport(data: FilteredExportData, t: TranslationFunction): Promise<void> {
  let csvContent = '';

  if (data.benches.length > 0) {
    csvContent += `\n\n=== ${t('export.sections.benches').toUpperCase()} ===\n\n`;
    csvContent += generateBenchesCsv(data.benches, t);
  }

  if (data.components.length > 0) {
    csvContent += `\n\n=== ${t('export.sections.components').toUpperCase()} ===\n\n`;
    csvContent += generateComponentsCsv(data.components, t);
  }

  if (data.history.length > 0) {
    csvContent += `\n\n=== ${t('export.sections.history').toUpperCase()} ===\n\n`;
    csvContent += generateHistoryCsv(data.history, data.userMap, t);
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadBlob(blob, `export-${timestamp}.csv`);
}

// TXT Export
async function generateTxtExport(data: FilteredExportData, t: TranslationFunction): Promise<void> {
  let txtContent = `${t('export.title').toUpperCase()}\n`;
  txtContent += `Generated: ${new Date().toLocaleString()}\n`;
  txtContent += '='.repeat(80) + '\n\n';

  if (data.benches.length > 0) {
    txtContent += `${t('export.sections.benches').toUpperCase()}\n`;
    txtContent += '-'.repeat(80) + '\n';
    data.benches.forEach((bench) => {
      txtContent += `\nName: ${bench.name}\n`;
      txtContent += `Serial Number: ${bench.serialNumber}\n`;
      txtContent += `AGILE Code: ${bench.agileCode}\n`;
      txtContent += `Description: ${bench.description}\n`;
      txtContent += `PLM AGILE URL: ${bench.plmAgileUrl}\n`;
      txtContent += `Decaweb URL: ${bench.decawebUrl}\n`;
      if (bench.tags.length > 0) {
        txtContent += `Tags: ${bench.tags.map((t) => t.tagName).join(', ')}\n`;
      }
      txtContent += '\n';
    });
  }

  if (data.components.length > 0) {
    txtContent += `\n${t('export.sections.components').toUpperCase()}\n`;
    txtContent += '-'.repeat(80) + '\n';
    data.components.forEach(({ benchName, components }) => {
      txtContent += `\nBench: ${benchName}\n`;
      components.forEach((comp) => {
        txtContent += `  - ${comp.componentName}\n`;
        txtContent += `    Manufacturer Reference: ${comp.manufacturerReference}\n`;
        txtContent += `    Validity Date: ${comp.validityDate}\n`;
        txtContent += `    Expiration Date: ${comp.expirationDate}\n`;
        txtContent += `    Status: ${comp.status}\n`;
      });
      txtContent += '\n';
    });
  }

  if (data.history.length > 0) {
    txtContent += `\n${t('export.sections.history').toUpperCase()}\n`;
    txtContent += '-'.repeat(80) + '\n';
    txtContent += generateHistoryTxt(data.history, data.userMap, t);
  }

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadBlob(blob, `export-${timestamp}.txt`);
}

// SQLite Export
async function generateSqliteExport(data: FilteredExportData, t: TranslationFunction): Promise<void> {
  const { generateSqliteDatabase } = await import('./sqliteExport');
  const sqliteBlob = await generateSqliteDatabase(data, t);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadBlob(sqliteBlob, `export-${timestamp}.sqlite`);
}

// Helper functions for CSV generation
function generateBenchesCsv(benches: any[], t: TranslationFunction): string {
  let csv = 'Name,Serial Number,AGILE Code,Description,PLM AGILE URL,Decaweb URL,Tags\n';
  benches.forEach((bench) => {
    const tags = bench.tags.map((t: any) => t.tagName).join('; ');
    csv += `"${escapeCsv(bench.name)}","${escapeCsv(bench.serialNumber)}","${escapeCsv(bench.agileCode)}","${escapeCsv(bench.description)}","${escapeCsv(bench.plmAgileUrl)}","${escapeCsv(bench.decawebUrl)}","${escapeCsv(tags)}"\n`;
  });
  return csv;
}

function generateComponentsCsv(components: any[], t: TranslationFunction): string {
  let csv = 'Bench,Component Name,Manufacturer Reference,Validity Date,Expiration Date,Status\n';
  components.forEach(({ benchName, components: comps }) => {
    comps.forEach((comp: any) => {
      csv += `"${escapeCsv(benchName)}","${escapeCsv(comp.componentName)}","${escapeCsv(comp.manufacturerReference)}","${escapeCsv(comp.validityDate)}","${escapeCsv(comp.expirationDate)}","${escapeCsv(comp.status)}"\n`;
    });
  });
  return csv;
}

function generateHistoryCsv(history: any[], userMap: Map<string, any>, t: TranslationFunction): string {
  let csv = 'Bench,Timestamp,Action,User,Entity,Details\n';
  history.forEach(({ benchName, entries }) => {
    entries.forEach((entry: any) => {
      const timestamp = new Date(Number(entry.timestamp) / 1_000_000).toLocaleString();
      const user = userMap.get(entry.user.toString());
      const userName = user?.username || entry.user.toString();
      const userEntity = user?.entity || '';
      csv += `"${escapeCsv(benchName)}","${escapeCsv(timestamp)}","${escapeCsv(entry.action)}","${escapeCsv(userName)}","${escapeCsv(userEntity)}","${escapeCsv(entry.details)}"\n`;
    });
  });
  return csv;
}

function generateHistoryTxt(history: any[], userMap: Map<string, any>, t: TranslationFunction): string {
  let txt = '';
  history.forEach(({ benchName, entries }) => {
    txt += `\nBench: ${benchName}\n`;
    entries.forEach((entry: any) => {
      const timestamp = new Date(Number(entry.timestamp) / 1_000_000).toLocaleString();
      const user = userMap.get(entry.user.toString());
      const userName = user?.username || entry.user.toString();
      const userEntity = user?.entity || '';
      txt += `  [${timestamp}] ${entry.action} by ${userName}${userEntity ? ` (${userEntity})` : ''}\n`;
      txt += `    ${entry.details}\n`;
    });
    txt += '\n';
  });
  return txt;
}

function escapeCsv(value: string): string {
  if (!value) return '';
  return value.replace(/"/g, '""');
}
