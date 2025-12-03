'use strict';

exports.up = async (pgm) => {
  await pgm.createExtension('vector', { ifNotExists: true });
};

exports.down = async (pgm) => {
  await pgm.dropExtension('vector', { ifExists: true });
};
