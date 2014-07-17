using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;

public class FingerPrint : IHttpHandler
{
    private static Regex r = new Regex(@"(href|src)=(""|')(?<href>.*?)(""|').*?>");

    public void ProcessRequest(HttpContext context)
    {
        string file = context.Request.PhysicalPath;
        string html = File.ReadAllText(file);
        DateTime lastWrite = File.GetLastWriteTimeUtc(file);

        html = r.Replace(html, delegate(Match match)
        {
            return InsertTag(context, match);
        });

        context.Response.Write(html);

        SetConditionalGetHeaders(lastWrite, context);
        context.Response.Cache.SetValidUntilExpires(true);
        context.Response.Cache.SetCacheability(HttpCacheability.ServerAndPrivate);
        context.Response.Cache.SetExpires(DateTime.Now.AddDays(7));
    }

    private static string InsertTag(HttpContext context, Match match)
    {
        string value = match.Value;
        string path = match.Groups["href"].Value;
        Uri url;

        if (Uri.TryCreate(path, UriKind.Relative, out url) &&
            Path.GetExtension(url.OriginalString) != "" &&
            !url.OriginalString.StartsWith("//"))
        {
            int index = value.LastIndexOf('.');

            if (index > -1)
            {
                string abosolute = context.Server.MapPath(path);
                DateTime lastWrite = File.GetLastWriteTimeUtc(abosolute);
                context.Response.AddFileDependency(abosolute);

                return value.Insert(index, "." + lastWrite.Ticks);
            }
        }

        return value;
    }

    public static void SetConditionalGetHeaders(DateTime lastModified, HttpContext context)
    {
        HttpResponse response = context.Response;
        HttpRequest request = context.Request;
        lastModified = new DateTime(lastModified.Year, lastModified.Month, lastModified.Day, lastModified.Hour, lastModified.Minute, lastModified.Second);

        string incomingDate = request.Headers["If-Modified-Since"];

        response.Cache.SetLastModified(lastModified);

        DateTime testDate = DateTime.MinValue;

        if (DateTime.TryParse(incomingDate, out testDate) && testDate == lastModified)
        {
            response.ClearContent();
            response.StatusCode = (int)System.Net.HttpStatusCode.NotModified;
            response.SuppressContent = true;
        }
    }

    public bool IsReusable { get { return false; } }
}