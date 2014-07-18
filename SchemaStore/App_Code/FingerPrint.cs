using System;
using System.Configuration;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;

public class FingerPrint : IHttpHandler
{
    private static Regex _regex = new Regex(@"<(link|script|img).*(href|src)=(""|')(?<href>[^""'].*?)(""|').*?>");
    private static string _cdnPath = ConfigurationManager.AppSettings.Get("cdnPath");

    public void ProcessRequest(HttpContext context)
    {
        string file = context.Request.PhysicalPath;
        string html = File.ReadAllText(file);
        DateTime lastWrite = File.GetLastWriteTimeUtc(file);

        html = _regex.Replace(html, delegate(Match match)
        {
            return Print(context, match);
        });

        html = Regex.Replace(html, @">\s+<", "><");
        html = Regex.Replace(html, @"\s+", " ");

        context.Response.Write(html);

        SetConditionalGetHeaders(lastWrite, context);
        context.Response.AddFileDependency(file);
        context.Response.Cache.SetValidUntilExpires(true);
        context.Response.Cache.SetCacheability(HttpCacheability.ServerAndPrivate);
        context.Response.Cache.SetExpires(DateTime.Now.AddDays(7));
    }

    private static string Print(HttpContext context, Match match)
    {
        string value = match.Value;
        string path = match.Groups["href"].Value;
        Uri url;

        if (!IsValidUrl(path, out url))
            return value;

        value = AddCdn(context, value, path);

        string physical = context.Server.MapPath(path);
        DateTime lastWrite = File.GetLastWriteTimeUtc(physical);
        context.Response.AddFileDependency(physical);

        int index = value.LastIndexOf('.');
        return value.Insert(index, "." + lastWrite.Ticks);
    }

    private static string AddCdn(HttpContext context, string value, string path)
    {
        if (string.IsNullOrEmpty(_cdnPath))
            return value;

        string absolute = _cdnPath + Path.GetDirectoryName(context.Request.Path)
            .Replace("\\", "/")
            .TrimEnd('/') + "/";

        Uri baseUri = new Uri(absolute);
        Uri full = new Uri(baseUri, path);
        return value.Replace(path, full.OriginalString);
    }

    private static bool IsValidUrl(string path, out Uri url)
    {
        //if (!path.StartsWith("/", StringComparison.Ordinal))
        //    throw new NotSupportedException("The path '" + path + "' has to start with a /");

        return Uri.TryCreate(path, UriKind.Relative, out url) &&
               Path.GetExtension(url.OriginalString) != "" && // Only files with extensions
               !url.OriginalString.StartsWith("//"); // Not protocol relative paths since they are absolute
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