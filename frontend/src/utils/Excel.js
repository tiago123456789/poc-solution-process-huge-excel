import readXlsxFile from 'read-excel-file'

export default {

    async read(file) {
        if (!file) {
            return {
                headers: [],
                body: [],
                totalSteps: 0
            }
        }
        let headers = null;
        const rows = await readXlsxFile(file)
        headers = rows[0]
        rows.shift();
        const steps = rows.length / 1000
        return {
            headers,
            body: rows,
            totalSteps: parseInt(steps),
        }
    }
}