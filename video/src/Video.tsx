import { Composition, Series } from "remotion";
import { Intro } from "./scenes/Intro";
import { Hook } from "./scenes/Hook";
import { FeatureAvis } from "./scenes/FeatureAvis";
import { FeatureLoyalty } from "./scenes/FeatureLoyalty";
import { FeatureScan } from "./scenes/FeatureScan";
import { Pricing } from "./scenes/Pricing";
import { CTA } from "./scenes/CTA";

const MainVideo: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={90}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <Hook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={210}>
        <FeatureAvis />
      </Series.Sequence>
      <Series.Sequence durationInFrames={180}>
        <FeatureLoyalty />
      </Series.Sequence>
      <Series.Sequence durationInFrames={180}>
        <FeatureScan />
      </Series.Sequence>
      <Series.Sequence durationInFrames={240}>
        <Pricing />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <CTA />
      </Series.Sequence>
    </Series>
  );
};

export const VideoComposition: React.FC = () => {
  return (
    <Composition
      id="TocTocToc"
      component={MainVideo}
      durationInFrames={1200}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
