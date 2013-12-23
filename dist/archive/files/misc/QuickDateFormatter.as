package com.fmr.utils
{
    import mx.formatters.DateFormatter;

    public class QuickDateFormatter
    {
        public static function format(str_dateString:String, str_dateFormat:String):String
        {
            var f:DateFormatter = new DateFormatter();
            f.formatString = str_dateFormat;
            return f.format(str_dateString);
        }
    }
}