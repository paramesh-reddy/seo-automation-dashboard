/**
 * Mock Services Master Index
 * Governed by USE_MOCKS flag
 */
export * from './pagespeed.mock.ts';
export * from './gsc.mock.ts';
export * from './dataforseo.mock.ts';
export * from './twilio.mock.ts';

export const isMockEnabled = () => {
  return process.env.USE_MOCKS !== 'false';
};
