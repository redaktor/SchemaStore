<%@ WebHandler Language="C#" Class="api" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;
using Newtonsoft.Json;

public class api : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        string folder = context.Server.MapPath("~/schemas/");
        
        WriteJsonToOutput(folder, context);
        SetHeaders(folder, context);
    }

    private static void WriteJsonToOutput(string folder, HttpContext context)
    {
        Uri root = new Uri(folder);
        Uri url = context.Request.Url;
        string domain = url.Scheme + "://" + url.Authority + "/schemas/";

        var urls = from f in Directory.EnumerateFiles(folder, "*.json")
                   select domain + root.MakeRelativeUri(new Uri(f));

        var settings = new JsonSerializerSettings { Formatting = Formatting.Indented };        
        var serializer = JsonSerializer.Create(settings);
        
        serializer.Serialize(context.Response.Output, urls);
    }

    private static void SetHeaders(string folder, HttpContext context)
    {
        context.Response.ContentType = "text/plain";

        // Set cache dependencies on the schema files and this .ashx file
        context.Response.AddFileDependency(folder);
        context.Response.AddFileDependency(context.Request.PhysicalPath);

        // Caches the response on both the server and client
        context.Response.Cache.SetValidUntilExpires(true);
        context.Response.Cache.SetExpires(DateTime.Now.AddDays(7));
        context.Response.Cache.SetCacheability(HttpCacheability.Public);
        context.Response.Cache.SetLastModifiedFromFileDependencies();
    }

    public bool IsReusable
    {
        get { return false; }
    }
}