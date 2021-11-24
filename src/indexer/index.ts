import { Service, Inject, Container } from "typedi";


@Service()
export default class IndexService {
    count: number;
    lastBlockNum: number;

    constructor(
      @Inject("web3") private web3
    ) {
        this.count = 0;
        this.lastBlockNum = 0;
    }

    public async fetchNewBlocks() {
        // this.lastBlockNum = await this.web3.eth.getBlockNumber();
        // console.log("current block num: ", this.lastBlockNum);
    }
  
    public main() {
        // this.fetchNewBlocks();
        this.count++;
        console.log(this.count)
        setTimeout(() => { this.main() }, 5000);
    }
}