/**
 * Set up event listeners for interactive parts of website
 */ 

if (document.readyState === 'loading') {
    // wait for DOM content to load before running
    document.addEventListener('DOMContentLoaded', add_project_listeners);
} else {
    // if DOM content loaded before script, just run 
    add_project_listeners();
};

/**
 * Control which project is displayed by listening to button clicks
 */
function add_project_listeners(){
    const class_active = 'is-active'
    const proj_select_items = document.querySelector('#projects_select').querySelectorAll('li');
    const proj_content_items = document.querySelector('#projects_contents').querySelectorAll('div');

    proj_select_items.forEach((menu_item) => {
        menu_item.addEventListener('click', (event) => {
            // make all tabs not active
            proj_select_items.forEach((node) => {
                node.classList.remove(class_active);
            });
            // hide all projects' contents
            proj_content_items.forEach((node) => {
                node.style.display = 'none';
            });
            // show selected project
            document.querySelector(event.target.dataset.target).style.display = 'block';
            // make selected project's menu tab active
            menu_item.classList.add(class_active);
        });
    });
};
