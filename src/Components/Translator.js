import translations from './translations.json';


function translate(element) {
  if (element in translations) {
    return translations[element];
  }

  return element;
}


export default translate;
