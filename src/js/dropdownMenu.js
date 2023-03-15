import $ from 'jquery';

export function setupDropdownMenu() {

    /* When the user clicks on the button, toggle between hiding and showing the dropdown content */
    function toggleDropdown() {
        document.getElementById("myDropdown").classList.toggle("show");
        return false;
    }

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    $('#menuDropdownOpenButton').on("click",function() {
        toggleDropdown();
    }).on("keyup",function(e) {
        if(e.which===13){
            toggleDropdown();
        }
    });

    $('#menuDropdownCloseButton').on("click",function() {
        toggleDropdown();
    });

}


