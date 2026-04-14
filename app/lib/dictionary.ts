import id from '../../dictionaries/id.json';
import en from '../../dictionaries/en.json';
import zh from '../../dictionaries/zh.json';
import ko from '../../dictionaries/ko.json';
import th from '../../dictionaries/th.json';
import vi from '../../dictionaries/vi.json';
import af from '../../dictionaries/af.json';
import hi from '../../dictionaries/hi.json';

const dictionaries: any = { id, en, zh, ko, th, vi, af, hi };

export const getDictionary = (locale: string) => {
  return dictionaries[locale] || id;
};
