declare module "aos" {
  const AOS: {
    init: (options?: Record<string, unknown>) => void;
    refresh: () => void;
    refreshHard: () => void;
  };
  export default AOS;
}
