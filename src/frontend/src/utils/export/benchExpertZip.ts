import type { backendInterface } from '../../backend';
import type { TranslationKey } from '../../i18n/translations';
import { downloadBlob } from '../download';

type TranslationFunction = (key: TranslationKey) => string;

/**
 * Generates a bench expert ZIP export with folder structure:
 * /Bench Name/
 *   /components/
 *     /Component Name (S/N)/
 *       history.txt
 * 
 * Note: This implementation creates a simple text-based export since jszip is not available.
 * For a proper ZIP file, jszip would need to be added to package.json dependencies.
 */
export async function generateBenchExpertZip(
  actor: backendInterface,
  benchIds: string[],
  t: TranslationFunction
): Promise<void> {
  let exportContent = '';
  exportContent += '='.repeat(80) + '\n';
  exportContent += 'BENCH EXPERT EXPORT\n';
  exportContent += `Generated: ${new Date().toLocaleString()}\n`;
  exportContent += '='.repeat(80) + '\n\n';

  for (const benchId of benchIds) {
    try {
      // Fetch expert data for this bench
      const expertData = await actor.exportExpertData(benchId);
      const bench = expertData.bench;
      const components = expertData.components;
      const componentMovements = expertData.componentMovements;

      // Bench header
      exportContent += '\n' + '='.repeat(80) + '\n';
      exportContent += `BENCH: ${bench.name}`;
      if (bench.serialNumber) {
        exportContent += ` (S/N: ${bench.serialNumber})`;
      }
      exportContent += '\n';
      if (bench.agileCode) {
        exportContent += `AGILE Code: ${bench.agileCode}\n`;
      }
      exportContent += '='.repeat(80) + '\n\n';

      // Components section
      exportContent += 'COMPONENTS:\n';
      exportContent += '-'.repeat(80) + '\n\n';

      if (components.length === 0) {
        exportContent += '  No components found.\n\n';
      } else {
        for (const component of components) {
          // Component header
          exportContent += `  Component: ${component.componentName}`;
          if (component.manufacturerReference) {
            exportContent += ` (${component.manufacturerReference})`;
          }
          exportContent += '\n';
          exportContent += '  ' + '-'.repeat(76) + '\n';

          // Component details
          exportContent += `  Status: ${component.status}\n`;
          exportContent += `  Validity Date: ${component.validityDate}\n`;
          exportContent += `  Expiration Date: ${component.expirationDate}\n`;

          // Find movement history for this component
          const movement = componentMovements.find(
            (m) => m.componentName === component.componentName
          );

          // Movement history
          if (movement && movement.movementSequence.length > 0) {
            const movements = parseMovementSequence(movement.movementSequence);
            if (movements.length > 0) {
              exportContent += `  Movements: ${movements.join(' ---> ')}\n`;
            } else {
              exportContent += `  Movements: ${bench.name} (current location)\n`;
            }
          } else {
            exportContent += `  Movements: ${bench.name} (current location, no history)\n`;
          }

          exportContent += '\n';
        }
      }

      exportContent += '\n';
    } catch (error: any) {
      console.error(`Failed to export bench ${benchId}:`, error);
      throw new Error(`${t('export.benchExpert.error.benchFailed')}: ${benchId} - ${error.message || String(error)}`);
    }
  }

  // Add footer
  exportContent += '='.repeat(80) + '\n';
  exportContent += 'END OF EXPORT\n';
  exportContent += '='.repeat(80) + '\n';

  // Create blob and download
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadBlob(blob, `bench-expert-export-${timestamp}.txt`);
}

/**
 * Parses movement sequence from history entry details
 * Expected format: "ComponentName BenchA->BenchB ManufacturerRef"
 */
function parseMovementSequence(movementDetails: string[]): string[] {
  const benches: string[] = [];

  for (const detail of movementDetails) {
    // Extract bench names from the movement detail string
    // Format: "ComponentName BenchA->BenchB ManufacturerRef"
    const match = detail.match(/\s+([^\s]+)->([^\s]+)\s+/);
    if (match) {
      const fromBench = match[1];
      const toBench = match[2];

      // Add fromBench if not already in the list
      if (benches.length === 0 || benches[benches.length - 1] !== fromBench) {
        benches.push(fromBench);
      }

      // Add toBench
      if (benches[benches.length - 1] !== toBench) {
        benches.push(toBench);
      }
    }
  }

  return benches;
}
