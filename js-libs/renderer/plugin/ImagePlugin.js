var ImagePlugin = Plugin.extend({
    _type: 'image',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
        var asset = '';
        if(data.asset) {
            //Removing ECML "validate" button generated by AuthoringTool
            if ((data.asset === "validate") || (data.asset === "next") || (data.asset === "previous")) {
               data.visible = false;
                // return;
            }
            asset = data.asset;
        } else if (data.model) {
            asset = this._stage.getModelValue(data.model);
        } else if (data.param) {
            asset = this.getParam(data.param);
        }
        if(_.isEmpty(asset)) {
            this._render = false;
            console.warn("ImagePlugin: Asset not found", data);
        } else {
            var assetSrc = this._theme.getAsset(asset);

            var img;
            if(_.isString(assetSrc)){
                img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = assetSrc;
            }else{
                img = assetSrc;
            }
            var s = new createjs.Bitmap(img);
            this._self = s;

            var dims = this.relativeDims();
            if (data.rotate) {
                this.rotation(data);
            }

            // // Align the image in its container
            // var xd = dims.x;
            // dims = this.alignDims();
            // s.x = dims.x;
            // s.y = dims.y;

            if(_.isString(assetSrc)){
                this._self.visible = false;
                AssetManager.strategy.loadAsset(this._stage._data.id, asset, assetSrc, function(){
                        Renderer.update = true;
                        setTimeout(function(){
                            var sb = s.getBounds();
                            if(sb) {
                                instance.setScale();
                            }
                            dims = instance.alignDims();
                            s.x = dims.x;
                            s.y = dims.y;
                            instance._self.visible = true;
                            Renderer.update = true;
                        }, 100)
                });
            }else{
                var sb = s.getBounds();
                if(sb) {
                    this.setScale();
                }
            }

            // Align the image in its container
            dims = this.alignDims();
            s.x = dims.x;
            s.y = dims.y;
            Renderer.update = true;
        }
    },
    alignDims: function() {
        var parentDims = this._parent.dimensions();
        var dims = this._dimensions;

        // Alignment of the image in its parent container
        var align  = (this._data.align ? this._data.align.toLowerCase() : "");
        var valign = (this._data.valign ? this._data.valign.toLowerCase() : "");

        if (align == "left") dims.x = 0;
        else if (align == "right") dims.x = (parentDims.w - dims.w);
        else if (align == "center") dims.x = ((parentDims.w - dims.w)/2);

        if (valign == "top") dims.y = 0;
        else if (valign == "bottom") dims.y = (parentDims.h - dims.h);
        else if (valign == "middle") dims.y = ((parentDims.h - dims.h)/2);

        return this._dimensions;
    },
    refresh: function() {
        var asset = '';
        if (this._data.model) {
            asset = this._stage.getModelValue(this._data.model);
        } else if (this._data.param) {
            asset = this.getParam(this._data.param);
        } else {
            asset = this._data.asset;
        }

        if (asset && this._theme && this._self) {
            var image = this._theme.getAsset(asset) ;
            this._self.image = image;
            Renderer.update = true;
        }
    },
});
PluginManager.registerPlugin('image', ImagePlugin);
