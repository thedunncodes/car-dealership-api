import { WithId, Document } from "mongodb";
import { formattedDataProps } from "../../constants/carTypes";

/**
 * This function paginates the data by slicing it into smaller chunks based on the page number and size.
 * It returns a subset of the data for the specified page.
 *
 * @param {formattedDataProps[] | WithId<Document>[]} data - The data to paginate.
 * @param {number} page - The current page number (1-based index).
 * @param {number} size - The number of items per page.
 * @returns {formattedDataProps[] | WithId<Document>[]} - A subset of the data for the specified page.
 */
export default function paginate(
    data: formattedDataProps[] | WithId<Document>[] , page: number, size: number
 ) : formattedDataProps[] | WithId<Document>[] {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return data.slice(startIndex, endIndex);
}