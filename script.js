const playground = document.getElementById('playground');
const controlGroups = document.querySelectorAll('.control-group');


controlGroups.forEach(group => {
    const property = group.dataset.property;
    const buttons = group.querySelectorAll('button');


    buttons.forEach(btn => {
        btn.addEventListener('click', () => {


            buttons.forEach(b => b.classList.remove('active'));


            btn.classList.add('active');


            const newValue = btn.dataset.value;


            if (!document.startViewTransition) {

                playground.style[property] = newValue;
                return;
            }


            document.startViewTransition(() => {
                playground.style[property] = newValue;
            });

        });
    });
});