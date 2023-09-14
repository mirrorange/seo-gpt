export const generateGuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
 

export const replaceWordsInText = (text: string, replaceWords: string) => {
    const replaceWordsList = replaceWords.split(",");
    let replacedText = text;
    for (const replaceWordPair of replaceWordsList) {
      const [originalWord, newWord] = replaceWordPair.split(":");
      const regex = new RegExp(originalWord, "g");
      replacedText = replacedText.replace(regex, newWord);
    }
    return replacedText;
  };