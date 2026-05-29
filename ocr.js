import Tesseract from 'tesseract.js';

export async function
 recognizeImage(imagePath) {

    const result = await Tesseract.recognize(
        imagePath,
        'chi_sim+eng'
    );

    return result.data.text;
}