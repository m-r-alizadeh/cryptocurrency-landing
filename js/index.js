$( document ).ready(function() {
    $.fn.multiply = function(numCopies) {
        for (var newElements = this.clone(), i = 1; i < numCopies; i++)
            newElements = newElements.add(this.clone());
        return newElements
    }
    $.fn.realTime = function(coin, priceusd) {
        var self = $(this), rate = self.data("rate"), currency = self.data("currency"), timeout = parseInt($(this).attr("data-timeout")) || 0, difference;
        if (Math.floor(Date.now()) - timeout > 1e4) {
            var price = crc.priceFormat(priceusd * rate, currency);
            self.html(price),
            priceusd > parseFloat(self.attr("data-price")) && self.animateCss("liveup"),
            priceusd < parseFloat(self.attr("data-price")) && self.animateCss("livedown"),
            self.attr("data-price", priceusd),
            self.attr("data-timeout", Math.floor(Date.now()))
        }
    }
    $.fn.extend({
        animateCss: function(animationName, callback) {
            var animationEnd = function(el) {
                var animations = {
                    animation: "animationend",
                    OAnimation: "oAnimationEnd",
                    MozAnimation: "mozAnimationEnd",
                    WebkitAnimation: "webkitAnimationEnd"
                };
                for (var t in animations)
                    if (void 0 !== el.style[t])
                        return animations[t]
            }(document.createElement("div"));
            return this.addClass("mcw-animated " + animationName).one(animationEnd, (function() {
                $(this).removeClass("mcw-animated " + animationName),
                "function" == typeof callback && callback()
            }
            )),
            this
        }
    });
    crc.number_format = function(number, decimals, dec_point, thousands_point) {
        if (null == number || !isFinite(number))
            return "";
        if (!decimals) {
            var len = number.toString().split(".").length;
            decimals = len > 1 ? len : 0
        }
        dec_point || (dec_point = "."),
        thousands_point || (thousands_point = ",");
        var splitNum = (number = (number = parseFloat(number).toFixed(decimals)).replace(".", dec_point)).split(dec_point);
        return splitNum[0] = splitNum[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_point),
        number = splitNum.join(dec_point)
    }
    crc.numberFormat = function(num, iso, shorten=!1, decimals="auto") {
        num = parseFloat(num);
        var format = void 0 !== crc.currency_format[iso] ? crc.currency_format[iso] : crc.default_currency_format;
        decimals = shorten ? format.decimals : "auto" == decimals ? num >= 1 ? format.decimals : 6 : parseInt(decimals),
        num = num.toFixed(decimals);
        var index = 0
          , suffix = ""
          , suffixes = ["", " K", " M", " B", " T"];
        if (shorten) {
            for (; num > 1e3; )
                num /= 1e3,
                index++;
            suffix = suffixes[index]
        }
        return crc.number_format(num, decimals, format.decimals_sep, format.thousands_sep) + suffix
    }
    crc.priceFormat = function(price, iso, shorten=!1, decimals="auto") {
        price = parseFloat(price);
        var format = void 0 !== crc.currency_format[iso] ? crc.currency_format[iso] : crc.default_currency_format;
        price = crc.numberFormat(price, iso, shorten, decimals);
        var out = format.position;
        return out = (out = (out = out.replace("{symbol}", '<b class="fiat-symbol">' + format.symbol + "</b>")).replace("{space}", " ")).replace("{price}", "<span>" + price + "</span>")
    }

    $(".cc-stats").each(function() {
         var listWidth = 0;
         $(this).find(".cc-coin").each(function() {
             listWidth += $(this).innerWidth()
         });
         var clonedElem = $(this).find(".cc-coin")
         , mult = $(this).innerWidth() / listWidth;
         $(this).append('<div class="cc-dup"></div>'),
         mult > .5 ? $(this).find(".cc-dup").append(clonedElem.multiply(Math.ceil(mult))) : $(this).find(".cc-dup").append(clonedElem.multiply(1)),
         $(this).css("width", listWidth),
         $(this).find("canvas").each(function() {
             $(this).drawChart()
         });
         var itemcount = $(this).find(".cc-coin").length, itemsize = listWidth / itemcount, speed, duration = 10 * itemsize;
         200 === (speed = $(this).closest(".mcw-ticker").data("speed")) ? duration = 10 : 0 == speed ? duration = 0 : speed > 100 ? duration -= speed = (speed -= 100) / 10 * itemsize : speed < 100 && (duration += speed = (speed = 100 - speed) / 10 * (8 * itemsize));
         var speed = itemcount * duration / 1e3;
         $(this).css("animation-duration", speed + "s"),
         $(this).closest(".mcw-ticker").css("visibility", "visible"),
         $(this).closest(".mcw-ticker").hasClass("mcw-header") && ($("body").css("padding-top", $(this).closest(".mcw-ticker").height() + "px"),
         $("#wpadminbar").css("margin-top", $(this).closest(".mcw-ticker").height() + "px"))
    })

$('.mcw-ticker').show();

    var realtimes = $('[data-realtime="on"]');
    if (realtimes.length > 0) {
        var socket = new WebSocket("wss://ws.coincap.io/prices?assets=ALL");
        socket.addEventListener("message", (function(msg) {
            var prices = JSON.parse(msg.data);
            for (var coin in prices)
                realtimes.find('[data-live-price="' + coin + '"]').each((function() {
                    $(this).realTime(coin, prices[coin])
                }
                ))
        }
        ))
    }
});
