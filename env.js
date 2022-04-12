const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const validate = require('dotenv-validator').default;

const example = fs.readFileSync(
  path.resolve(__dirname, '.env.example'),
  'utf-8'
);

const { envRules, envDefault } = example.split('\n').reduce(
  (env, line) => {
    const [nameSlug, valueAndDescriptors] = line.split('=');
    const name = (nameSlug || '').trim();

    if (!name) {
      return env;
    }

    const [valueSlug, descriptorsSlug] = (valueAndDescriptors || '').split('#');
    const value = (valueSlug || '').trim();
    const descriptors = (descriptorsSlug || '')
      .trim()
      .replace('#')
      .split(',')
      .map((d) => d.toLowerCase().trim());
    const isRequired = !descriptors.includes('optional');

    env.envDefault[name] = isRequired ? value : '';
    env.envRules[name] = {
      required: isRequired,
    };

    return env;
  },
  { envRules: {}, envDefault: {} }
);

/**
 * Loads `.env` file contents into process.env.
 *
 * See https://docs.dotenv.org
 *
 * @param options - additional options. example: `{ path: './custom/path', encoding: 'latin1', debug: true, override: false }`
 * @returns an object with a `parsed` key if successful or `error` key if an error occurred. example: { parsed: { KEY: 'value' } }
 *
 */
function config(options) {
  const envParsed = dotenv.config(options).parsed;
  validate({ envParsed, envDefault, envRules });

  return envParsed;
}

module.exports = {
  config,
};
