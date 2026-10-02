import React, { createContext, useContext, useState, useEffect } from 'react';
import { zh } from './zh.js';
import { en } from './en.js';

const dictionaries = { zh, en };

const LanguageContext = createContext({
  lang: 'zh',
  setLang: () => {},
  t: (key, params) => key
});

export function LanguageProvider({ children, initialLang = 'zh', onLangChange }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    if (initialLang && initialLang !== lang) {
      setLangState(initialLang);
    }
  }, [initialLang]);

  const setLang = (newLang) => {
    setLangState(newLang);
    if (onLangChange) {
      onLangChange(newLang);
    }
  };

  const t = (key, params = {}) => {
    const dict = dictionaries[lang] || dictionaries.zh;
    let text = dict[key] || dictionaries.zh[key] || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
