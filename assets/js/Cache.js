var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class Cache {
    static getInstance() {
        if (!this.instance)
            this.instance = new Cache();
        return this.instance;
    }
    constructor() {
        this.data = [];
        this.timeout = 1000 * 20;
    }
    getData(key) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield fetch(key);
            const json = yield response.json();
            this.setData(key, json);
            console.log('CACHE MISS');
            return this.data.find(e => e.key === key).content;
        });
    }
    setData(key, content) {
        const existingDataIndex = this.data.findIndex(e => e.key === key);
        if (existingDataIndex >= 0) {
            this.data[existingDataIndex] = {
                key,
                content,
                when: new Date()
            };
        }
        else {
            this.data.push({
                key,
                content,
                when: new Date()
            });
        }
    }
}
