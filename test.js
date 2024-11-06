const country = 'Bangladesh'; // constant value
const countryCode = 'BD'; // isoAlpha2 code for Bangladesh

const { getFlagBase64 } = require('country-data-codes');

const flagBase64 = getFlagBase64(countryCode);

const html = `
    <img 
        alt="${country}" 
        src="data:image/png;base64, ${flagBase64}" 
        style="width: 24px; height: 24px;" // adjust size to emoji size
    />
`;

console.log(html);