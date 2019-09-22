
const MaxSlideCount = 99;
const regexSplitMarkdownByHeader = new RegExp('\\n+#{1,2}[^\\n]+', 'g');


/**
 * Splits a markdown string into an array of markdown slides, separating them by main/large headers, eg: "# Header 1" or "## Header 2"
 *
 * @param markdownText
 * @returns {[]}
 */
export function splitMarkdownIntoSlides(markdownText) {
  const slides = [];
  const addSlide = md => {
    md = md.trim();
    if (md.length) {
      slides.push(md);
    }
  };

  markdownText = `\n${markdownText.trim()}`; // adding linebreak to front to simplify regex
  let cursor = 1; // setting to 1 to skip the first linebreak, though we trim it anyway so it doesn't matter
  let slideCount = 0;
  let match;

  while ((slideCount < MaxSlideCount) && (match = regexSplitMarkdownByHeader.exec(markdownText)) !== null) {
    addSlide(markdownText.slice(cursor, match.index));
    cursor = match.index;
    // todo: should it split markdown using  '---' as slide break too? If so, do not add it to the resulting slide. (Add its length to the cursor)
    slideCount += 1;
  }
  addSlide(markdownText.slice(cursor));

  return slides;
}
