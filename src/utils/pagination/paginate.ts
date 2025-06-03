import { WithId, Document } from "mongodb";
import { formattedDataProps } from "../../constants/carTypes";

export default function paginate(
    data: formattedDataProps[] | WithId<Document>[] , page: number, size: number
 ) : formattedDataProps[] | WithId<Document>[] {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return data.slice(startIndex, endIndex);
}