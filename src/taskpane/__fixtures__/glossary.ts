import { Glossary } from "../models/Glossary";
import { Language } from "../models/Language";

export const english = new Language("English", "en", 1);
export const hungarian = new Language("Magyar", "hu", 2);

export const createGlossaryWithWords = () => {
    const defaultGlossary = new Glossary(english, hungarian);
    defaultGlossary.addRange([
        { key: "1", original: "SensitivE", translation: "ÉrzékenY", note: "no" },
        { key: "2", original: "nOn sEnsItIve", translation: "nEm ÉrzÉkEny" },
        { key: "3", original: "whole word", translation: "teljes szo" },
        { key: "4", original: "notwhole word", translation: "nemteljes szo" },
        { key: "5", original: "Whole Sensitive", translation: "Teljes Érzékeny" },
        { key: "6", original: "NotWhole Sensitive", translation: "NemTeljes Érzékeny" }
    ]);
    return defaultGlossary;
};

export const createEmptyGlossary = () => {
    return new Glossary(english, hungarian);
};