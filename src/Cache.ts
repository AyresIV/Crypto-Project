export default class Cache {
    data: {
        key: string;
        content: object;
        when: Date;
    }[] = [];

    timeout: number = 1000 * 20;
    static instance: Cache;
    public static getInstance(): Cache {
        if (!this.instance) this.instance = new Cache();
        return this.instance;
    }

    private constructor() { }

    public async getData(key: string) {
        const existingData = this.data.find(e => e.key === key);
        if (existingData) {

            const now = new Date(); // this is now
            const when = new Date(existingData.when);

            const diff = now.getTime() - when.getTime();
            if (diff < this.timeout) {
                console.log('CACHE HIT');
                return existingData.content;
            }

        }
        const response = await fetch(key);
        const json = await response.json();
        this.setData(key, json);
        console.log('CACHE MISS');
        return this.data.find(e => e.key === key).content;
    }

    setData(key: string, content: object) {
        const existingDataIndex = this.data.findIndex(e => e.key === key);
    
        if (existingDataIndex >= 0) {
            this.data[existingDataIndex] = {
                key,
                content,
                when: new Date()
            };
        } else {
            this.data.push({
                key,
                content,
                when: new Date()
            });
        }
    }    
}