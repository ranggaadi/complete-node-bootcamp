class APIfeatures {
    constructor(query, requestQuery) {
        this.query = query;
        this.requestQuery = requestQuery;
    }

    filter() {
        // 1a. Simple Filtering
        // console.log(req.query);
        const queryObj = { ...this.requestQuery } //mengcopy isi dari req.query
        const exclude = ['limit', 'sort', 'page', 'fields'];
        exclude.forEach(el => delete queryObj[el]); //menghapus seua property yang ada di exclude
        // console.log(queryObj);

        // 1b. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`); //mereplace gt/gte dkk menjadi $gt / $gte dkk
        let filteredQuery = JSON.parse(queryStr);

        this.query = this.query.find(filteredQuery); //ini akan mereturn query sehingga dapat di chain
        return this; //mereturn object kelas ini agar bisa di chaining dengan fungsi lainnya.
    }

    sort() {
        if (this.requestQuery.sort) {
            const sortQuery = this.requestQuery.sort.split(',').join(' '); //memisahkan dua kondisi sort yang berbeda
            // console.log(sortQuery);
            this.query = this.query.sort(sortQuery); //sort dengan dua kondisi pada mongoose seperti (sort 1 sort2) dipisahkan dengan spasi
        } else {
            this.query = this.query.sort('-createdAt') //secara default akan mengurutkan dari yang terbaru.
            //apabila fungsi sort terdapat minus berarti secara descending
        }

        return this; //return this agar bisa dichain dengan yang lain.
    }

    project() {
        //3 Field Limiting / SELECT / Projection
        // console.log(req.query);

        if (this.requestQuery.fields) {
            const project = this.requestQuery.fields.split(',').join(' ');
            // console.log(project);
            this.query = this.query.select(project);
        } else {
            this.query = this.query.select('-__v'); //tanda minus pada select() berarti tidak akan ditampilkan
        }

        return this;
    }

    paginate() {
        //4.Pagination skip() dan limit
        const page = this.requestQuery.page * 1 || 1;
        const limit = this.requestQuery.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIfeatures;