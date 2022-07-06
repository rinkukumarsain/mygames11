const NOTIFICATION_TEXT = {
    BONUS: {
        TYPE: 'BONUS',
        BODY: (bonusamount, type) => {
            return `You have got Rs.${bonusamount} for ${type}.`;
        },
        TITLE: type => {
            return `${type}`;
        },
        TO_REDIRECT: true,
        IS_NOTIF: false,
    },
    ADD_AMOUNT: {
        TYPE: 'ADD AMOUNT',
        BODY: (amount, PaymnetMethod) => {
            return `You have added Rs.${amount} by ${PaymnetMethod}.`;
        },
        TITLE: 'Payment Done',
        TO_REDIRECT: true,
        IS_NOTIF: false,
    },
    WITHDRAW_APPROVE: {
        TYPE: 'Withdrawal Request Approved!',
        BODY: amount => {
            return `Withdraw Request Approved successfully of amount Rs.${amount}`;
        },
        TITLE: 'Withdrawal Request Approved!',
        TO_REDIRECT: true,
        IS_NOTIF: false,
    },
};

module.exports = NOTIFICATION_TEXT;