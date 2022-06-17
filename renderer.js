class Renderer {
    zoomIn(point) {

    }

    zoomOut(point) {

    }

    draw(context, game) {
        context.fillStyle = 'white';
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (game.dCount < 3) {
            let iter = game.iterator;
            while (!iter.end) {

                context.fillStyle = 'black';
                let p = iter.next(iter);

                if (p === undefined)
                    return;

                if (game.dCount == 1)
                    context.fillRect(p[0] * 8, 0, 8, 8);

                if (game.dCount == 2)
                    context.fillRect(p[0] * 8, p[1] * 8, 8, 8);
            }
        }


        let maxColor = Number(Math.pow(2, 24) - 1);
        if (game.dCount > 2) {
            let iter = game.multiDimIterator;
            while (!iter.end) {
                let p = iter.next(iter);

                if (p === undefined)
                    return;


                context.fillStyle = '#' + Number(Math.floor(maxColor *
                    (p[2] / Math.pow(game.width, game.dCount - 2)))).toString(16);
                context.fillRect(p[0] * 20, p[1] * 20, 20, 20);
            }
        }
    }
}