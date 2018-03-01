export const prettyConsole = {
    postActivity(c, activities, next) {
        let first;

        for (let activity of activities) {
            if (activity.type === 'message') {
                activity.text = '> '
                    + activity.text
                        .split('\n')
                        .join(`\n> `)
                    + '\n';

                if (!first) {
                    activity.text = '\n' + activity.text;
                    first = activity;
                }
            }
        }

        return next();
    }
}