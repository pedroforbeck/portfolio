const controlGroups = document.querySelectorAll('.control-group');

controlGroups.forEach(group => {
    const targetId = group.dataset.target;
    const property = group.dataset.property;
    const targetElement = document.getElementById(targetId);
    const buttons = group.querySelectorAll('button');

    const isFlexAnimator = group.classList.contains('flex-animator');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {


            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const newValue = btn.dataset.value;

            if (!isFlexAnimator || !document.startViewTransition) {
                targetElement.style[property] = newValue;
                return;
            }

            document.startViewTransition(() => {
                targetElement.style[property] = newValue;
            });

        });
    });
});