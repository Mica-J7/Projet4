(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
  
    prevImage() {
      const lightboxImage = document.querySelector(".lightboxImage");
      let activeImage = null;

      // Récupérer toutes les images de la galerie
      const galleryImages = Array.from(document.querySelectorAll(".item-column img"));

      // Trouver l'image active (celle qui est actuellement affichée dans la lightbox)
      galleryImages.forEach((img) => {
        if (img.src === lightboxImage.src) {
          activeImage = img;
        }
      });

      // Récupérer le tag actif
      const activeTag = document.querySelector(".tags-bar .active-tag").dataset.imagesToggle;

      // Filtrer les images selon le tag actif => condition ? si vrai : si faux (autre façon de faire un if else)
      const filteredImages = activeTag === "all" 
        ? galleryImages  // Si le tag est "Tous", on prend toutes les images
        : galleryImages.filter((img) => img.dataset.galleryTag === activeTag);  // Sinon, on filtre par tag

      // Trouver l'index de l'image active dans les images filtrées
      let currentIndex = filteredImages.indexOf(activeImage);
      
      // Si l'index est 0, on va à la dernière image de la catégorie filtrée
      if (currentIndex === 0) {
        currentIndex = filteredImages.length;
      }

      // Trouver l'image précédente dans les images filtrées
      const prevImage = filteredImages[currentIndex - 1];

      // Vérifier si l'image précédente existe avant de changer l'attribut src
      if (prevImage) {
        lightboxImage.src = prevImage.src;
      }
    },

    nextImage() {
      const lightboxImage = document.querySelector(".lightboxImage");
      let activeImage = null;

      // Récupérer toutes les images de la galerie
      const galleryImages = Array.from(document.querySelectorAll(".item-column img"));

      // Trouver l'image active (celle qui est actuellement affichée dans la lightbox)
      galleryImages.forEach((img) => {
        if (img.src === lightboxImage.src) {
          activeImage = img;
        }
      });

      // Récupérer le tag actif
      const activeTag = document.querySelector(".tags-bar .active-tag").dataset.imagesToggle;

      // Filtrer les images selon le tag actif => condition ? si vrai : si faux (autre façon de faire un if else)
      const filteredImages = activeTag === "all" 
        ? galleryImages  // Si le tag est "Tous", on prend toutes les images
        : galleryImages.filter((img) => img.dataset.galleryTag === activeTag);  // Sinon, on filtre par tag

      // Trouver l'index de l'image active dans les images filtrées
      let currentIndex = filteredImages.indexOf(activeImage);
      
      // Si l'index est 0, on va à la dernière image de la catégorie filtrée
      const nextIndex = (currentIndex + 1) % filteredImages.length;

      // Trouver l'image précédente dans les images filtrées
      const nextImage = filteredImages[nextIndex];

      // Vérifier si l'image précédente existe avant de changer l'attribut src
      if (nextImage) {
        lightboxImage.src = nextImage.src;
      }
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    
    filterByTag: function(event) {
      // Récupère le bouton de filtre cliqué (celui qui déclenche l'événement)
      const clickedTag = event.currentTarget;

      // Sélectionne tous les filtres (les <span> dans la barre de navigation)
      const tagList = document.querySelectorAll(".nav-item span");
      const allImages = document.querySelectorAll(".gallery-item");
    
      tagList.forEach(t => t.classList.remove("active", "active-tag"));
      clickedTag.classList.add("active", "active-tag");
      
      // Récupère le tag sélectionné via l'attribut data-images-toggle
      const selectedTag = clickedTag.dataset.imagesToggle;
    
      allImages.forEach(image => {
        const imageTag = image.dataset.galleryTag;
        const imageColumn = image.closest(".item-column");
    
        if (selectedTag === "all" || imageTag === selectedTag) {
          imageColumn.style.display = "";
        } else {
          imageColumn.style.display = "none";
        }
      });
    }
  };
})(jQuery);


// Test débuggage selection des filtres de la galerie en JS classique.

// Le problème venait du addEventListener dans filterByTag. On faisait deja un .on click en jQuery pour appeler filterByTag qui ajoutait donc
// un event listener avant de fonctionner normalement. Cela faisait un clique "dans le vide" avant de fonctionner lors de la selection 
// de la catégorie. Plus d'event listener dans filterByTag, plus de souci.