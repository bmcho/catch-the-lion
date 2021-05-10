import { Board, Cell, DaedZone } from "./board";
import { Lion } from "./Piece";
import { Player, PlayerType } from "./Player";


export class Game {
    private selectedCell: Cell;
    private turn = 0;
    private currentPlayer: Player;
    private gameInfoEl = document.querySelector('.alert');
    private state: 'STARTED' | 'END' = 'STARTED';

    readonly upperPlayer = new Player(PlayerType.UPPER);
    readonly lowerPlayer = new Player(PlayerType.LOWER);

    readonly board = new Board(this.upperPlayer, this.lowerPlayer);
    readonly upperDeadZone = new DaedZone('upper');
    readonly lowerDeadZone = new DaedZone('lower');

    constructor() {
        const boardContainer = document.querySelector('.board-container');
        boardContainer.firstChild.remove();
        boardContainer.appendChild(this.board._el);

        this.currentPlayer = this.upperPlayer;
        this.board.render();
        this.renderInfo();

        this.board._el.addEventListener('click', e => {
            if(this.state === 'END') {
                return;
            }

            if(e.target instanceof HTMLElement) {
                let cellEl: HTMLElement;
                if(e.target.classList.contains('cell')) {
                    cellEl = e.target;
                } else if(e.target.classList.contains('piece')) {
                    cellEl = e.target.parentElement;
                } else {
                    return;
                }

                const cell = this.board.map.get(cellEl);

                if(this.isCurrentUserPiece(cell)) {
                    this.select(cell);
                    return;
                }

                if(this.selectedCell) {
                    this.move(cell);
                    this.changeTurn();
                }
            }
        });
    }

    select(cell:Cell) {
        if(this.selectedCell) {
            this.selectedCell.deactive();
            this.selectedCell.render();
        }

        this.selectedCell = cell;
        cell.active();
        cell.render();
    }

    move(cell:Cell) {
        this.selectedCell.deactive();
        const killed = this.selectedCell.getPiece().move(this.selectedCell, cell).getKilled();
        this.selectedCell = cell;

        if(killed) {
            if(killed.ownerType === PlayerType.UPPER) {
                this.lowerDeadZone.put(killed);
            } else {
                this.upperDeadZone.put(killed);
            }

            if(killed instanceof Lion) {
                this.state = 'END';
            }
        }
    }

    isCurrentUserPiece(cell:Cell) {
        return cell != null && cell.getPiece() != null && cell.getPiece().ownerType === this.currentPlayer.type
    }
    renderInfo(extraMessage?: string) {
        this.gameInfoEl.innerHTML = `#${this.turn}턴 ${this.currentPlayer.type} 차례 ${extraMessage ? '|' + extraMessage : ''}`
    } 

    changeTurn() {
        this.selectedCell.deactive();
        this.selectedCell = null;

        if(this.state === 'END') {
            this.renderInfo('END!')
        } else {
            this.turn += 1;
            this.currentPlayer = (this.currentPlayer === this.lowerPlayer) ? this.upperPlayer : this.lowerPlayer;
            this.renderInfo();
        }
        this.board.render();
    }
}