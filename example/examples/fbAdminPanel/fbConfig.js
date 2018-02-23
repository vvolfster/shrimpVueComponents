import Dialog from '../../../src/layout/dialog';

const state = {
    db: null,
}

function loadFromLocalStorage() {
    try {
        state.db = JSON.parse(localStorage.getItem('shrimpVueComponents_fbConf'));
    } catch(e) {
        state.db = null;
    }
}

export default {
    getConf() {
        return new Promise((resolve, reject) => {
            loadFromLocalStorage();
            if(state.db)
                return resolve(state.db);

            Dialog.create({
                title: "Enter Firebase Config",
                description: "You can get this from the use webapi",
                form: {
                    fbConf: {
                        type: JSON,
                        options: {
                            mode: "code",
                            style: 'width:50vw;',
                        },
                        model: {
                            apiKey: "YOUR API KEY",
                            authDomain: "YOUR-APP.firebaseapp.com",
                            databaseURL: "https://YOUR-APP.firebaseio.com",
                            projectId: "YOUR-APP",
                            storageBucket: "YOUR-APP.appspot.com",
                            messagingSenderId: "YOUR MESSGE SENDER ID KEY"
                        }
                    }
                },
                buttons: {
                    Submit({ fbConf }){
                        state.db = fbConf;
                        localStorage.setItem('shrimpVueComponents_fbConf', JSON.stringify(state.db));
                        resolve(state.db);
                    }
                },
                onDismiss: reject
            })
        })
    }
}
