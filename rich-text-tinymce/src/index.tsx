import { connect, OnBootCtx } from "datocms-plugin-sdk";
import { render } from "./utils/render";
import { PluginAttributes } from "datocms-plugin-sdk/dist/types/SiteApiSchema";
import FieldExtension from "./entrypoints/FieldExtension";
import ConfigScreen from "./entrypoints/ConfigScreen";
import "datocms-react-ui/styles.css";

connect({
  async onBoot(ctx: OnBootCtx) {
    if (
      !ctx.currentRole.meta.final_permissions.can_edit_schema ||
      ctx.plugin.attributes.parameters.migratedFromLegacyPlugin
    ) {
      return;
    }

    const fields = await ctx.loadFieldsUsingPlugin();

    await Promise.all(
      fields.map(async (field) => {
        if (field.attributes.appearance.editor === ctx.plugin.id) {
          await ctx.updateFieldAppearance(field.id, [
            {
              operation: "updateEditor",
              newFieldExtensionId: "tinyMce",
            },
          ]);
        }
      })
    );

    await ctx.updatePluginParameters({
      ...ctx.plugin.attributes.parameters,
      migratedFromLegacyPlugin: true,
    });

    ctx.notice("Plugin upgraded successfully!");
  },
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions() {
    return [
      {
        id: "tinyMce",
        name: "Tiny MCE",
        type: "editor",
        fieldTypes: ["text"] as NonNullable<PluginAttributes["field_types"]>,
      },
    ];
  },
  renderFieldExtension(id, ctx) {
    render(<FieldExtension ctx={ctx} />);
  },
});
