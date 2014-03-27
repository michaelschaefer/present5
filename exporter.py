# exporter.py
import os
import shutil
import sys


mime_type = {
	"png" : "image/png",
	"svg" : "image/svg+xml",
	"woff" : "application/font-woff"
}


def extract_attribute(str, attribute):
	start = str.find("%s=\"" % attribute)
	if (start == -1):
		return None
	start += (len(attribute) + 2)
	end = str.find("\"", start)
	if (end == -1):
		return None
	return str[start:end]


def find_import_rule(str, index = 0):
	start = str.find("@import url(", index)
	if (start == -1):
		return None
	end = str.find(");", start)
	if (end == -1):
		return None
	return (start, end + 2)


def find_link_tag(str, index = 0):
	start = str.find("<link", index)
	if (start == -1):
		return None
	end = str.find(">", start)
	if (end == -1):
		return None
	return (start, end + 2)


def find_media_files(base_dir, str):
	start = str.find("<style")
	if (start == -1):
		return None
	end = str.find("</style>")
	if (end == -1):
		return None

	style_content = str[start:end]

	rg = find_url_rule(style_content)
	file_list = []
	while (rg != None):
		path = style_content[rg[0]+5:rg[1]-2]
		index = path.rfind("/")
		if index == -1:
			entry = (".", path)
		else:
			entry = (path[0:path.rfind("/")], path[path.rfind("/")+1:])
		file_list.append(entry)
		rg = find_url_rule(style_content, rg[1])

	return file_list


def find_script_tag(str, index = 0):
	start = str.find("<script", index);
	if (start == -1):
		return None
	end = str.find("</script>", start);
	if (end == -1):
		return None
	return (start, end + 9);


def find_url_rule(str, index = 0):
	start = str.find("url(", index)
	if (start == -1):
		return None
	end = str.find(")", start)
	if (end == -1):
		return None
	return (start, end+1)


def import_encoded_data(base_dir, content):
	index = 0
	while (True):
		start = content.find("url(", index)
		if start == -1:
			break
		end = content.find(")", start)
		if (end == -1):
			break
		
		filename = content[start+5:end-1]
		fileextension = filename[filename.rfind(".")+1:]
		if mime_type.has_key(fileextension):
			mime = mime_type[fileextension]
		else:
			index = end
			continue

		with open("%s/%s" % (base_dir, filename), "rb") as f:
			data = f.read().encode("base64").replace('\n', '').replace('\r', '')
			data = "data:%s;base64,%s" % (mime, data)
			content = "%s\"%s\"%s" % (content[0:start+4], data, content[end:])
			index = start + 5 + len(data)		

	return content


def import_image_data(base_dir, content):
	index = 0
	while True:
		start = content.find("src=", index)
		if start == -1:
			break
		end = content.find(" ", start)
		if end == -1:
			break

		filename = content[start+5:end-1]
		fileextension = filename[filename.rfind(".")+1:]
		if mime_type.has_key(fileextension):
			mime = mime_type[fileextension]
		else:
			index = end
			continue
		
		with open("%s/%s" % (base_dir, filename), "rb") as f:
			data = f.read().encode("base64").replace('\n', '').replace('\r', '')
			data = "data:%s;base64,%s" % (mime, data)
			content = "%s\"%s\"%s" % (content[:start+4], data, content[end:])
			index = start + 5 + len(data)
	return content


def move_media_files(folder, base_dir, media_file_list):
	try:
		os.mkdir(folder)
	except OSError:
		pass
	
	for file in media_file_list:
		try:
			os.mkdir("%s/%s" % (folder, file[0]))
		except OSError:
			pass
		shutil.copy2("%s/%s/%s" % (base_dir, file[0], file[1]), "%s/%s/" % (folder, file[0]))
	pass


def read_file(filename):
	file = open(filename)
	content = ""
	for line in file:
		content = "%s%s" % (content, line)
	file.close()
	return content


def replace_css_imports(file_content, base_url = "."):
	if (file_content == None):
		return None
	if (base_url == None):
		return None

	rg = find_import_rule(file_content)
	while (rg != None):
		css_file = "%s/%s" % (base_url, file_content[rg[0]+13:rg[1]-3])
		file_content = "%s%s%s" % (file_content[:rg[0]], read_file(css_file), file_content[rg[1]:])
		rg = find_import_rule(file_content)
	return file_content


def replace_css_tags(file_content):
	if (file_content == None):
		return [None, None]

	# find tag range
	rg = find_link_tag(file_content)
	while (rg != None):
		# get css code and base url
		tag = file_content[rg[0]:rg[1]]
		if (extract_attribute(tag, "type") == "text/css"):
			css_file = extract_attribute(tag, "href")
			base_url = "./%s" % css_file[:css_file.rfind("/")]
			all_css = read_file("./%s" % css_file)

			# replace <link .../> by css code in <style> element
			file_content = "%s<style type=\"text/css\">\n%s\n</style>\n%s" % (file_content[0:rg[0]], all_css, file_content[rg[1]:])
		rg = find_link_tag(file_content, rg[0] + len(all_css))

	# after importing css code, replace @import url(..) rules
	file_content = replace_css_imports(file_content, base_url)

	return [file_content, base_url]


def replace_script_tags(file_content):
	if (file_content == None):
		return None

	all_js = ""
	rg = find_script_tag(file_content)
	while (rg != None):
		tag = file_content[rg[0]:rg[1]]
		script_file = extract_attribute(tag, "src")
		if (script_file == "js/present5.js"):
			pass
		else:
			all_js = "%s%s" % (all_js, read_file("./%s" % script_file))
		rg = find_script_tag(file_content, rg[1])

	start = file_content.find("<script")
	if (start == -1):
		return None
	end = file_content.rfind("</script>")
	if (end == -1):
		return None

	file_content = "%s<script type=\"text/javascript\">\n%s%s" % (file_content[0:start], all_js, file_content[end:])
	return file_content


def save_file(folder, file_name, file_content):
	try:
		os.mkdir(folder)
	except OSError:
		pass

	file = open("%s/%s" % (folder, file_name), 'w')
	file.write(file_content)
	file.close()


def strip_comments(content):
	while True:
		start = content.find("/*")
		if start == -1:
			break
		end = content.find("*/")
		content = "%s%s" % (content[0:start], content[end+2:])
		
	return content


def main():

	input_file_name = ""
	output_file_name = ""
	folder = ""
	n = len(sys.argv)	

	if (n < 2):
		print("Usage: python exporter.py inputfile [outputfile, folder]")
		print("If you omit outputfile, inputfile.exported will be used")
		print("If you omit folder, current directory will be used")
		return
	else:
		input_file_name = sys.argv[1]
		output_file_name = "%s.exported" % input_file_name
		folder = "."

		if (n > 2):
			output_file_name = sys.argv[2]
		if (n > 3):
			folder = sys.argv[3]

	start_basedir = input_file_name.rfind("/")
	if start_basedir == -1:
		base_dir = "."
	else:
		base_dir = input_file_name[:start_basedir]

	file_content = replace_script_tags(read_file(input_file_name))
	[file_content, base_dir_css] = replace_css_tags(file_content)
	file_content = strip_comments(file_content);

	if (1 == 0):
		media_file_list = find_media_files(base_dir_css, file_content)
		move_media_files(folder, base_dir_css, media_file_list)
	else:
		file_content = import_encoded_data(base_dir_css, file_content)
		file_content = import_image_data(base_dir, file_content)

	save_file(folder, output_file_name, file_content)
	


main()
