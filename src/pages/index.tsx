import { Metadata } from "next";
import Head from "next/head";
import { Inter } from "next/font/google";
import { useState } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { generateData, generateFeed } from "@/utils/generate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEO GPT",
  description: "用于生成 SEO 文章的 GPT 工具",
};

export default function Home() {
  const [keywords, setKeywords] = useState("");
  const [quantity, setQuantity] = useState("");
  const [toT, setToT] = useState(false);
  const [footer, setFooter] = useState("");
  const [replaceWords, setReplaceWords] = useState("");
  const [showAccordion, setShowAccordion] = useState(false);
  const [topics, setTopics] = useState("");
  const [content, setContent] = useState("");
  const [feed, setFeed] = useState("");
  const [topicsLoading, setTopicsLoading] = useState("Loading");
  const [contentLoading, setContentLoading] = useState("Loading");
  const [feedLoading, setFeedLoading] = useState("Loading");
  const [generationDone, setGenerationDone] = useState(false);
  const [apikey, setApikey] = useState("");
  const [apibase, setApibase] = useState("https://api.openai.com/v1");
  const [model, setModel] = useState("gpt-3.5-turbo");

  const reset = () => {
    setGenerationDone(false);
    setTopicsLoading("Loading");
    setContentLoading("Loading");
    setFeedLoading("Loading");
    setTopics("");
    setContent("");
    setFeed("");
  };

  const generateTopics = async (keywords: string, quantity: string) => {
    const prompt = `请作为SEO文章主题生成器，生成 ${quantity} 个有关下列关键字的SEO文章主题，一行一个（标阿拉伯数字序号），**不要**生成解释或任何多余的内容\n\n${keywords}`;
    const topics = (
      await generateData(prompt, apikey, apibase, model, setTopics)
    )
      .split("\n")
      .filter((item) => item.trim() !== "")
      .map((item) => item.replace(/^\d+\.\s*/, "").trim())
      .join("\n");
    setTopics(topics);
    return topics;
  };

  const generateContents = async (topics: string) => {
    const topicList = topics.split("\n");
    let contents = "";
    for (const topic of topicList) {
      const prompt = `请作为SEO文章生成器，编写一篇有关以下主题的SEO文章，仅返回文章内容（不含标题），**不要**生成解释、声明或任何多余的内容\n\n${topic}`;
      const content = await generateData(
        prompt,
        apikey,
        apibase,
        model,
        (data) => {
          setContent(contents + data);
        }
      );
      contents += `${content}\n\n<-- SEOGPT_ARTICLE_END -->\n\n`;
      setContent(contents);
    }
    return { topics, contents };
  };

  const handleSubmit = () => {
    reset();
    generateTopics(keywords, quantity)
      .then((topics) => {
        setTopicsLoading("Done");
        generateContents(topics)
          .then(({ topics, contents }) => {
            setContentLoading("Done");
            setGenerationDone(true);
            setFeed(generateFeed(topics, contents, footer, replaceWords, toT));
            setFeedLoading("Done");
          })
          .catch((error) => {
            console.error(error);
            setContentLoading("Error");
            setFeedLoading("Error");
          });
      })
      .catch((error) => {
        console.error(error);
        setTopicsLoading("Error");
        setContentLoading("Error");
        setFeedLoading("Error");
      });
    setShowAccordion(true);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([feed], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "SEOGPT_Export.xml";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <Head>
        <title>SEO GPT</title>
      </Head>
      <main className={`${inter.className}`}>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          className="min-h-screen"
        >
          <div className="flex flex-row space-x-4 w-3/4 lg:w-1/2 xl:w-1/3">
            <TextField
              className="basis-1/3"
              label="API Key"
              value={apikey}
              onChange={(e) => setApikey(e.target.value)}
            />
            <TextField
              className="basis-1/3"
              label="API Base"
              value={apibase}
              onChange={(e) => setApibase(e.target.value)}
            />
            <Autocomplete
              className="basis-1/3"
              options={["gpt-3.5-turbo", "gpt-4"]}
              value={model}
              onChange={(e, value) => setModel(value || "gpt-3.5-turbo")}
              renderInput={(params) => (
                <TextField {...params} label="GPT Model" />
              )}
            />
          </div>
          <TextField
            className="w-3/4 lg:w-1/2 xl:w-1/3"
            label="尾部信息"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            multiline
            rows={2}
          />
          <TextField
            className="w-3/4 lg:w-1/2 xl:w-1/3"
            label="替换词表"
            value={replaceWords}
            onChange={(e) => setReplaceWords(e.target.value)}
            multiline
            rows={2}
          />
          <div className="flex flex-row space-x-4 w-3/4 lg:w-1/2 xl:w-1/3">
            <TextField
              className="basis-1/2"
              label="关键词"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <TextField
              className="basis-1/6"
              label="数量"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <FormControlLabel
              className="basis-1/6"
              control={<Switch onChange={() => setToT(!toT)} />}
              label={toT ? "繁体" : "简体"}
            />
            <Button className="basis-1/6" onClick={handleSubmit}>
              提交
            </Button>
          </div>
          {showAccordion && (
            <div className="w-3/4 lg:w-1/2 xl:w-1/3">
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {topicsLoading === "Loading" && (
                    <CircularProgress size={20} className="mr-4" />
                  )}
                  {topicsLoading === "Done" && (
                    <CheckCircleOutlineIcon className="mr-4" color="success" />
                  )}
                  {topicsLoading === "Error" && (
                    <ErrorOutlineIcon className="mr-4" color="error" />
                  )}
                  <Typography>生成 SEO 文章主题</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    className="w-full"
                    multiline
                    rows={10}
                    InputProps={{ readOnly: true }}
                    value={topics}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {contentLoading === "Loading" && (
                    <CircularProgress size={20} className="mr-4" />
                  )}
                  {contentLoading === "Done" && (
                    <CheckCircleOutlineIcon className="mr-4" color="success" />
                  )}
                  {contentLoading === "Error" && (
                    <ErrorOutlineIcon className="mr-4" color="error" />
                  )}
                  <Typography>生成 SEO 文章内容</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    className="w-full"
                    multiline
                    rows={10}
                    InputProps={{ readOnly: true }}
                    value={content}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {feedLoading === "Loading" && (
                    <CircularProgress size={20} className="mr-4" />
                  )}
                  {feedLoading === "Done" && (
                    <CheckCircleOutlineIcon className="mr-4" color="success" />
                  )}
                  {feedLoading === "Error" && (
                    <ErrorOutlineIcon className="mr-4" color="error" />
                  )}
                  <Typography>生成 RSS Feed</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    className="w-full"
                    multiline
                    rows={10}
                    InputProps={{ readOnly: true }}
                    value={feed}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          )}
          {generationDone && (
            <div className="flex flex-row space-x-4 w-3/4 lg:w-1/2 xl:w-1/3">
              <Button className="basis-1/2" onClick={handleSubmit}>
                再次生成
              </Button>
              <Button className="basis-1/2" onClick={handleDownload}>
                下载文件
              </Button>
            </div>
          )}
        </Stack>
      </main>
    </>
  );
}
