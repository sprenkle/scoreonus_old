import {Setting} from '../../../models/setting';
import {Cell} from '../../../models/cell';

export class SpadesLogic {
  private config: Object;

  constructor(config: Object) {
    this.config = config;
  }

  private isNilBid(cells: Cell[], bidIndex: number, madeIndex: number): boolean {
    return cells[bidIndex].value === 'N' || cells[bidIndex].value === 'BN';
  }

  private calcScore(cells: Cell[], bidIndex: number, madeIndex: number): number {
    var strBid = cells[bidIndex].value;
    var strMade = cells[madeIndex].value;

    if (strBid == null || strMade == null) return 0;

    if (strBid === 'N') {
      if (strMade === 'N') {
        cells[madeIndex].status = 'perfectBid';
        return this.config['nil-made'];
      } else {
        cells[madeIndex].status = 'overBid';
        return this.config['nil-over'] + Number(cells[madeIndex].value);
      }
    }

    if (strBid === 'BN') {
      if (strMade === 'N') {
        cells[madeIndex].status = 'perfectBid';
        return this.config['blindNil-made'];
      } else {
        cells[madeIndex].status = 'overBid';
        return this.config['blindNil-over'] + Number(cells[madeIndex].value);
      }
    }
    var bid: number = Number(cells[bidIndex].value);
    var made: number = Number(cells[madeIndex].value);
    if (made === NaN) return 0;
    this.calcBidStatus(cells, bidIndex, madeIndex);
    return this.calcBidMade(bid, made);
  }

  private calcBidMade(bid: number, made: number) {
    if (made < bid) {
      return bid * -10;
    } else if (made === bid) {
      return bid * 10;
    } else if (made > bid) {
      return bid * 10 + (made - bid);
    }
    return 0;
  }

  private calcBidStatus(cells: Cell[], bidIndex: number, madeIndex: number) {
    var bid: number = Number(cells[bidIndex].value);
    var made: number = Number(cells[madeIndex].value);
    if (made === NaN) return 0;

    if (made < bid) {
      cells[madeIndex].status = 'overBid';
    } else if (made === bid) {
      cells[madeIndex].status = 'perfectBid';
    } else if (made > bid) {
      cells[madeIndex].status = 'underBid';
    }
  }


  update(cells: Cell[][], score: Cell[]) {
    score[0].value = 0;
    score[1].value = 0;
    var nullValue = false;
    for (var i = 0; i < cells.length; i++) {
      var rowScore: number[] = [];
      var row = cells[i];
      // Checking for null value for creating a new row or not.
      for (var j = 0; j < row.length; j++) {
        if (row[j].value === "" || row[j].value == null) {
          nullValue = true;
        }
      }

      if (this.isNilBid(row, 0, 1) || this.isNilBid(row, 2, 3)) {
        rowScore[0] = this.calcScore(row, 0, 1);
        rowScore[0] += this.calcScore(row, 2, 3);
      } else {
        var bid: number = Number(row[0].value) + Number(row[2].value);
        var made: number = Number(row[1].value) + Number(row[3].value);
        if (made === NaN) {
          rowScore[0] = 0;
        } else {
          rowScore[0] = this.calcBidMade(bid, made);
          this.calcBidStatus(row, 0, 1);
          this.calcBidStatus(row, 2, 3);
        }
      }

      if (this.isNilBid(row, 5, 6) || this.isNilBid(row, 7, 8)) {
        rowScore[1] = this.calcScore(row, 5, 6);
        rowScore[1] += this.calcScore(row, 7, 8);
      } else {
        var bid: number = Number(row[5].value) + Number(row[7].value);
        var made: number = Number(row[6].value) + Number(row[8].value);
        if (made === NaN) {
          rowScore[1] = 0;
        } else {
          rowScore[1] = this.calcBidMade(bid, made);
          this.calcBidStatus(row, 5, 6);
          this.calcBidStatus(row, 7, 8);
        }
      }


      row[4].value = String(rowScore[0]);
      row[9].value = String(rowScore[1]);
      score[0].value += rowScore[0];
      score[1].value += rowScore[1];
    }
    // Check for if new row is needed
    if (!nullValue) {
      if (this.config['playTo'] <= score[0].value || this.config['playTo'] <= score[1].value) {
        if (score[0].value > score[1].value) {
          score[0].status = 'perfectBid';
          score[1].status = 'overBid';
        } else if (score[0].value < score[1].value) {
          score[1].status = 'perfectBid';
          score[0].status = 'overBid';
        } else {
          score[0].status = 'underBid';
          score[1].status = 'underBid';
        }
      } else
        cells.push(this.getNewRow());
    }
  }


  getNewRow(): Cell[] {
    var cells: Cell[] = [];
    for (var j: number = 0; j < 10; j++) {
      cells[j] = new Cell();
    }
    cells[4].value = '0';
    cells[9].value = '0';
    return cells;
  }
}