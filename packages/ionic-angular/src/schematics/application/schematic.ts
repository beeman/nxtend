import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { formatFiles, updateJsonInTree } from '@nrwl/workspace';
import init from '../init/schematic';
import { addDependencies } from './lib/add-dependencies';
import { addProject } from './lib/add-project';
import {
  generateCapacitorProject,
  generateNrwlAngularApplication,
} from './lib/external-schematic';
import { addFiles, removeFiles } from './lib/files';
import { normalizeOptions } from './lib/normalize-options';
import { ApplicationSchematicSchema, NormalizedSchema } from './schema';

function updateEslintConfig(options: NormalizedSchema) {
  return updateJsonInTree(
    `${options.appProjectRoot}/.eslintrc.json`,
    (json) => {
      console.log(json);
      const tsOverride = json.overrides.find(
        (override: { files: string | string[] }) =>
          override.files.includes('*.ts')
      );
      tsOverride.rules['@angular-eslint/component-class-suffix'] = [
        'error',
        {
          suffixes: ['Page', 'Component'],
        },
      ];
      tsOverride.rules['@angular-eslint/no-empty-lifecycle-method'] = 0;
      tsOverride.rules['@typescript-eslint/no-empty-function'] = 0;
      return json;
    }
  );
}

export default function (options: ApplicationSchematicSchema): Rule {
  return (host: Tree) => {
    const normalizedOptions = normalizeOptions(host, options);

    return chain([
      init(),
      addDependencies(),
      generateNrwlAngularApplication(normalizedOptions),
      addFiles(normalizedOptions),
      removeFiles(normalizedOptions),
      addProject(normalizedOptions),
      updateEslintConfig(normalizedOptions),
      generateCapacitorProject(normalizedOptions),
      formatFiles(),
    ]);
  };
}
